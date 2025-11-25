package com.hehe.thesocial.service.documentIngestion;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hehe.thesocial.dto.response.documentingestion.BatchIngestionResponse;
import com.hehe.thesocial.dto.response.documentingestion.DocumentIngestionResponse;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.service.file.FileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.ExtractedTextFormatter;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.config.PdfDocumentReaderConfig;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DocumentIngestionServiceImpl implements DocumentIngestionService {
    VectorStore vectorStore;
    ObjectMapper objectMapper;
    FileService fileService;

    @Override
    public DocumentIngestionResponse ingest(MultipartFile file, String metadataJson) throws IOException {
        if (file.isEmpty()) {
            throw new AppException(ErrorCode.DOCUMENT_EMPTY_FILE);
        }

        fileService.storeFile(file, "");

        log.info("Received and stored file for ingestion: {}, size: {} bytes, type: {}",
                file.getOriginalFilename(),
                file.getSize(),
                file.getContentType());

        Map<String, Object> metadata = parseMetadata(metadataJson);
        metadata.put("fileName", file.getOriginalFilename());
        metadata.put("fileSize", file.getSize());
        metadata.put("contentType", file.getContentType());
        metadata.put("uploadTimestamp", System.currentTimeMillis());

        List<Document> documents;

        String contentType = file.getContentType();
        String fileName = file.getOriginalFilename();

        if (contentType != null && contentType.equals("application/pdf")) {
            documents = processPdfDocument(file, metadata);
        } else if (fileName != null && (fileName.endsWith(".txt") || fileName.endsWith(".md"))) {
            documents = processTextDocument(file, metadata);
        } else if (fileName != null && (fileName.endsWith(".doc") || fileName.endsWith(".docx"))) {
            documents = processWordDocument(file, metadata);
        } else if (contentType != null && contentType.startsWith("text/")) {
            documents = processTextDocument(file, metadata);
        } else {
            throw new AppException(ErrorCode.DOCUMENT_UNSUPPORTED_FORMAT);
        }

        if (documents.isEmpty()) {
            throw new AppException(ErrorCode.DOCUMENT_NO_CONTENT_EXTRACTED);
        }

        TokenTextSplitter splitter = new TokenTextSplitter(
                200,
                200,
                5,
                10,
                false
        );

        List<Document> splitDocs = splitter.apply(documents);

        log.info("Split {} documents into {} chunks", documents.size(), splitDocs.size());

        vectorStore.add(splitDocs);

        log.info("Successfully ingested document: {} ({} chunks created)",
                file.getOriginalFilename(),
                splitDocs.size());

        return DocumentIngestionResponse.builder()
                .message("Document ingested successfully")
                .filename(file.getOriginalFilename())
                .chunksCreated(splitDocs.size())
                .fileSize(file.getSize())
                .contentType(file.getContentType() != null ? file.getContentType() : "unknown")
                .build();
    }

    //Legacy ingest
    @Override
    public BatchIngestionResponse ingestBatch(MultipartFile[] files, String metadataJson) throws IOException {
        if (files == null || files.length == 0) {
            throw new AppException(ErrorCode.DOCUMENT_NO_FILES_PROVIDED);
        }

        log.info("Starting batch ingestion of {} files", files.length);

        int totalChunks = 0;
        int successCount = 0;
        int failureCount = 0;
        Map<String, String> failures = new HashMap<>();

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                try {
                    DocumentIngestionResponse response = ingest(file, metadataJson);
                    totalChunks += response.getChunksCreated();
                    successCount++;
                    log.info("Successfully ingested: {} ({} chunks)", file.getOriginalFilename(), response.getChunksCreated());
                } catch (Exception e) {
                    failureCount++;
                    failures.put(file.getOriginalFilename(), e.getMessage());
                    log.error("Failed to ingest {}: {}", file.getOriginalFilename(), e.getMessage());
                }
            } else {
                failureCount++;
                failures.put(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown", "File is empty");
                log.warn("Skipped empty file: {}", file.getOriginalFilename());
            }
        }

        log.info("Batch ingestion completed: {} successful, {} failed, {} total chunks",
                successCount, failureCount, totalChunks);

        return BatchIngestionResponse.builder().build().builder()
                .message("Batch ingestion completed")
                .totalFiles(files.length)
                .successCount(successCount)
                .failureCount(failureCount)
                .totalChunksCreated(totalChunks)
                .failures(!failures.isEmpty() ? failures : null)
                .build();
    }

    @Override
    public Map<String, Object> getSupportedFormats() {
        return Map.of(
                "supportedFormats", new String[]{
                        "PDF (.pdf)",
                        "Text files (.txt, .md)",
                        "Word documents (.doc, .docx)",
                        "Plain text (text/*)"
                },
                "maxFileSize", "Not specified - check server configuration",
                "notes", "Files are processed and split into chunks for vector storage"
        );
    }

    // Helper methods
    private Map<String, Object> parseMetadata(String metadataJson) {
        if (metadataJson == null || metadataJson.trim().isEmpty()) {
            return new HashMap<>();
        }

        try {
            Map<String, Object> parsed = objectMapper.readValue(
                    metadataJson,
                    new TypeReference<Map<String, Object>>() {
                    }
            );
            log.debug("Parsed metadata: {}", parsed);
            return parsed;
        } catch (Exception e) {
            log.warn("Failed to parse metadata JSON: {}, using empty metadata", e.getMessage());
            return new HashMap<>();
        }
    }

    private List<Document> processWordDocument(MultipartFile file, Map<String, Object> metadata) throws IOException {
        ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };


        TikaDocumentReader tikaDocumentReader = new TikaDocumentReader(resource);

        List<Document> documents = tikaDocumentReader.get();
        documents.forEach(doc -> doc.getMetadata().putAll(metadata));

        return documents;
    }

    private List<Document> processTextDocument(MultipartFile file, Map<String, Object> metadata) throws IOException {
        log.info("Processing text document: {}", file.getOriginalFilename());

        String content = new String(file.getBytes());

        if (content.trim().isEmpty()) {
            throw new AppException(ErrorCode.DOCUMENT_NO_CONTENT_EXTRACTED);
        }

        Document document = new Document(content, metadata);
        log.info("Extracted {} characters from text file", content.length());

        return List.of(document);
    }

    private List<Document> processPdfDocument(MultipartFile file, Map<String, Object> metadata) {
        PdfDocumentReaderConfig config = PdfDocumentReaderConfig.builder()
                .withPageExtractedTextFormatter(
                        new ExtractedTextFormatter.Builder()
                                .withNumberOfBottomTextLinesToDelete(3)
                                .withNumberOfTopPagesToSkipBeforeDelete(1)
                                .build()
                )
                .withPagesPerDocument(1)
                .build();

        PagePdfDocumentReader pdfDocumentReader = new PagePdfDocumentReader(file.getResource(), config);

        List<Document> documents = pdfDocumentReader.get();

        documents.forEach(doc -> {
            doc.getMetadata().putAll(metadata);
            doc.getMetadata().put("pageNumber", doc.getMetadata().get("page_number"));
        });

        return documents;
    }

    private String determineContentType(String fileName) {
        if (fileName == null) {
            return "application/octet-stream";
        }

        String lowerFileName = fileName.toLowerCase();
        if (lowerFileName.endsWith(".pdf")) {
            return "application/pdf";
        } else if (lowerFileName.endsWith(".txt")) {
            return "text/plain";
        } else if (lowerFileName.endsWith(".md")) {
            return "text/markdown";
        } else if (lowerFileName.endsWith(".doc")) {
            return "application/msword";
        } else if (lowerFileName.endsWith(".docx")) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else {
            return "application/octet-stream";
        }
    }

}
