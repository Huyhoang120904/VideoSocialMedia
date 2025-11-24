package com.hehe.thesocial.service.documentIngestion;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

public interface DocumentIngestionService {
    com.hehe.thesocial.dto.response.documentingestion.DocumentIngestionResponse ingest(MultipartFile file, String metadataJson) throws IOException;

    //Legacy ingest
    com.hehe.thesocial.dto.response.documentingestion.BatchIngestionResponse ingestBatch(MultipartFile[] files, String metadataJson) throws IOException;

    Map<String, Object> getSupportedFormats();
}
