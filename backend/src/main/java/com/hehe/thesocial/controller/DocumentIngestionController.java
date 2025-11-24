package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.response.documentingestion.BatchIngestionResponse;
import com.hehe.thesocial.dto.response.documentingestion.DocumentIngestionResponse;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.service.documentIngestion.DocumentIngestionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Controller for document ingestion operations.
 * Handles uploading and processing documents for vector storage.
 */
@RestController
@RequestMapping("/document-ingestion")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Tag(name = "Document Ingestion", description = "Document ingestion for RAG system - ADMIN only")
public class DocumentIngestionController extends BaseController {

    DocumentIngestionService documentIngestionService;

    /**
     * Ingest a single document file.
     * 
     * @param file The document file to ingest
     * @param metadataJson Optional JSON string containing metadata for the document
     * @return DocumentIngestionResponse with ingestion details
     */
    @PostMapping("/ingest")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DocumentIngestionResponse>> ingestDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "metadata", required = false) String metadataJson) {
        
        log.info("Received document ingestion request: {}, size: {} bytes, type: {}",
                file.getOriginalFilename(),
                file.getSize(),
                file.getContentType());

        try {
            DocumentIngestionResponse response = documentIngestionService.ingest(file, metadataJson);
            
            return created(response, response.getMessage());
        } catch (IOException e) {
            log.error("Error ingesting document: {}", file.getOriginalFilename(), e);
            throw new AppException(ErrorCode.DOCUMENT_INGESTION_FAILED);
        }
    }

    /**
     * Ingest multiple documents in batch (legacy endpoint).
     * 
     * @param files Array of document files to ingest
     * @param metadataJson Optional JSON string containing metadata for all documents
     * @return BatchIngestionResponse with batch ingestion results
     */
    @PostMapping("/ingest-batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BatchIngestionResponse>> ingestBatchDocuments(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "metadata", required = false) String metadataJson) {
        
        log.info("Received batch document ingestion request: {} files", files.length);

        try {
            BatchIngestionResponse response = documentIngestionService.ingestBatch(files, metadataJson);
            
            return created(response, response.getMessage());
        } catch (IOException e) {
            log.error("Error ingesting batch documents", e);
            throw new AppException(ErrorCode.DOCUMENT_INGESTION_FAILED);
        }
    }

    /**
     * Get supported document formats and ingestion information.
     * 
     * @return Map containing supported formats and configuration details
     */
    @GetMapping("/supported-formats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSupportedFormats() {
        log.info("Fetching supported document formats");
        
        Map<String, Object> formats = documentIngestionService.getSupportedFormats();
        
        return ok(formats, "Supported formats retrieved successfully");
    }
}

