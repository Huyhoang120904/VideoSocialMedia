package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.service.file.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/files")
@Slf4j
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<FileResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        log.info("Uploading file: {}", file.getOriginalFilename());
        FileResponse response = fileService.storeFile(file);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload-multiple")
    public ResponseEntity<List<FileResponse>> uploadMultipleFiles(
            @RequestParam("files") MultipartFile[] files) {
        log.info("Uploading {} files", files.length);
        List<FileResponse> responses = fileService.storeMultipleFile(files);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FileResponse> getFileById(@PathVariable String id) {
        FileResponse response = fileService.findDocumentById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<FileResponse>> getAllFiles(Pageable pageable) {
        Page<FileResponse> responses = fileService.findAllDocument(pageable);
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable String id) {
        fileService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/thumbnailImage/{uploader}/{filename:.+}")
    public ResponseEntity<Resource> serveThumbnail(@PathVariable String uploader, @PathVariable String filename) {
        try {
            log.info("Serving thumbnail request - uploader: {}, filename: {}", uploader, filename);
            
            Path filePath = Paths.get(uploadDir, "thumbnailImage", uploader, filename);
            log.info("Attempting to serve thumbnail: {}", filePath.toAbsolutePath());
            
            // Check if file exists
            if (!Files.exists(filePath)) {
                log.warn("Thumbnail does not exist: {}", filePath);
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                log.info("Thumbnail found and readable: {}", filePath);
                // Determine content type
                String contentType = determineContentType(filename);
                log.info("Content type determined as: {}", contentType);

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                log.warn("Thumbnail not found or not readable: {}", filePath);
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            log.error("Error serving thumbnail: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Unexpected error serving thumbnail: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{uploader}/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String uploader, @PathVariable String filename) {
        try {
            log.info("Serving file request - uploader: {}, filename: {}", uploader, filename);
            log.info("Upload directory: {}", uploadDir);
            
            Path filePath = Paths.get(uploadDir).resolve(uploader).resolve(filename);
            log.info("Attempting to serve file: {}", filePath.toAbsolutePath());
            
            // Check if file exists
            if (!Files.exists(filePath)) {
                log.warn("File does not exist: {}", filePath);
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                log.info("File found and readable: {}", filePath);
                // Determine content type
                String contentType = determineContentType(filename);
                log.info("Content type determined as: {}", contentType);

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                log.warn("File not found or not readable: {}", filePath);
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            log.error("Error serving file: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Unexpected error serving file: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    private String determineContentType(String filename) {
        String extension = "";
        if (filename.contains(".")) {
            extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        }

        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "bmp" -> "image/bmp";
            case "webp" -> "image/webp";
            case "mp4" -> "video/mp4";
            case "avi" -> "video/x-msvideo";
            case "mov" -> "video/quicktime";
            case "wmv" -> "video/x-ms-wmv";
            case "flv" -> "video/x-flv";
            case "webm" -> "video/webm";
            case "mkv" -> "video/x-matroska";
            case "mp3" -> "audio/mpeg";
            case "wav" -> "audio/wav";
            case "ogg" -> "audio/ogg";
            case "aac" -> "audio/aac";
            case "flac" -> "audio/flac";
            case "pdf" -> "application/pdf";
            case "txt" -> "text/plain";
            case "json" -> "application/json";
            case "xml" -> "application/xml";
            default -> "application/octet-stream";
        };
    }
}
