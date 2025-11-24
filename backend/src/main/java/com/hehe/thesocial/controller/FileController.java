package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.file.FileActionRequest;
import com.hehe.thesocial.dto.request.file.FileSearchRequest;
import com.hehe.thesocial.dto.response.file.FileListResponse;
import com.hehe.thesocial.dto.response.file.FileMetricsResponse;
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
import org.springframework.http.HttpStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/files")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "Files", description = "File upload and management endpoints")
public class FileController extends BaseController {

    private final FileService fileService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FileResponse>> uploadFile(@RequestParam("file") MultipartFile file) {
        log.info("Uploading file: {}", file.getOriginalFilename());
        FileResponse response = fileService.storeFile(file);
        return created(response, "File uploaded successfully");
    }

    @PostMapping("/upload-multiple")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<FileResponse>>> uploadMultipleFiles(
            @RequestParam("files") MultipartFile[] files) {
        log.info("Uploading {} files", files.length);
        List<FileResponse> responses = fileService.storeMultipleFile(files);
        return created(responses, "Files uploaded successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FileResponse>> getFileById(@PathVariable String id) {
        FileResponse response = fileService.findDocumentById(id);
        return ok(response, "File retrieved successfully");
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<FileResponse>>> getAllFiles(Pageable pageable) {
        Page<FileResponse> responses = fileService.findAllDocument(pageable);
        return ok(responses, "Files retrieved successfully");
    }

    @Operation(
            summary = "Search files",
            description = "Search files with keyword, filters, pagination"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Files retrieved successfully",
                    content = @Content(schema = @Schema(implementation = FileListResponse.class)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FileListResponse>> searchFiles(
            @Valid @RequestBody(required = false) FileSearchRequest request) {
        FileListResponse response = fileService.searchFiles(request);
        return ok(response, response.getMessage());
    }

    @Operation(
            summary = "Get file metrics",
            description = "Retrieve aggregated metrics for file dashboard"
    )
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FileMetricsResponse>> getFileMetrics() {
        FileMetricsResponse metrics = fileService.getFileMetrics();
        return ok(metrics, "File metrics retrieved successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<FileResponse>> deleteFile(
            @PathVariable String id,
            @Valid @RequestBody FileActionRequest request) {
        FileResponse response = fileService.deleteFile(id, request);
        return ok(response, "File soft-deleted successfully");
    }

    @PutMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<FileResponse>> restoreFile(
            @PathVariable String id,
            @Valid @RequestBody(required = false) FileActionRequest request) {
        FileResponse response = fileService.restoreFile(id, request);
        return ok(response, "File restored successfully");
    }

    @PutMapping("/{id}/flag")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<FileResponse>> flagFile(
            @PathVariable String id,
            @Valid @RequestBody FileActionRequest request) {
        FileResponse response = fileService.flagFile(id, request);
        return ok(response, "File flagged successfully");
    }

    @PutMapping("/{id}/unflag")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<FileResponse>> unflagFile(
            @PathVariable String id,
            @Valid @RequestBody(required = false) FileActionRequest request) {
        FileResponse response = fileService.unflagFile(id, request);
        return ok(response, "File unflagged successfully");
    }

    @GetMapping("/thumbnailImage/{uploader}/{filename:.+}")
    public ResponseEntity<Resource> serveThumbnail(@PathVariable String uploader, @PathVariable String filename) {
        Path filePath = Paths.get(uploadDir, "thumbnailImage", uploader, filename);
        return serveStaticResource(filePath, filename, "thumbnail");
    }

    @GetMapping("/{uploader}/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String uploader, @PathVariable String filename) {
        Path filePath = Paths.get(uploadDir).resolve(uploader).resolve(filename);
        return serveStaticResource(filePath, filename, "file");
    }

    private ResponseEntity<Resource> serveStaticResource(Path filePath, String filename, String contextLabel) {
        try {
            log.info("Serving {} request for path: {}", contextLabel, filePath.toAbsolutePath());
            if (!Files.exists(filePath)) {
                log.warn("{} does not exist: {}", contextLabel, filePath);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                String contentType = determineContentType(filename);
                log.info("Content type for {} determined as: {}", filename, contentType);
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            }

            log.warn("{} not readable: {}", contextLabel, filePath);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (MalformedURLException e) {
            log.error("Error serving {}: {}", contextLabel, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Unexpected error serving {}: {}", contextLabel, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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
