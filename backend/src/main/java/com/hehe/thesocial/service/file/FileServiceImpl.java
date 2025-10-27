package com.hehe.thesocial.service.file;

import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.entity.FileDocument;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.repository.FileRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileServiceImpl implements FileService {
    FileMapper fileMapper;
    FileRepository fileRepository;


    @NonFinal
    @Value("${file.upload-dir:uploads}")
    String uploadDir;

    @NonFinal
    @Value("${server.port:8082}")
    String serverPort;

    @NonFinal
    @Value("${server.servlet.context-path:/api/v1}")
    String contextPath;

    @NonFinal
    @Value("${server.host}")
    String serverHost;

    @Override
    public FileResponse storeFile(MultipartFile multipartFile) {
        String uploader = SecurityContextHolder.getContext().getAuthentication().getName();
        if (multipartFile.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }

        try {
            // Create upload directory if it doesn't exist
            String userUploadDir = uploadDir + "/" + uploader;
            Path uploadPath = Paths.get(userUploadDir);
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String originalFilename = multipartFile.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID() + fileExtension;

            // Save file to local storage
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(multipartFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Determine resource type based on file extension
            String resourceType = determineResourceType(fileExtension);

            // Create file URL using configured host (fallback to localhost if not configured)
            String host = (serverHost != null && !serverHost.isEmpty()) ? serverHost : "172.20.82.76";
            String fileUrl = "http://" + host + ":" + serverPort + contextPath + "/files/" + uploader + "/" + uniqueFilename;

            // Generate thumbnail for video files
            String thumbnailUrl = null;
            if ("video".equals(resourceType)) {
                try {

                    log.info("Generated thumbnail for video: {}", thumbnailUrl);
                    
                    // If thumbnail generation failed, create a default one
                    if (thumbnailUrl == null) {
                        log.warn("Thumbnail generation failed, creating default thumbnail");
                        thumbnailUrl = "http://" + host + ":" + serverPort + contextPath + "/files/default-thumbnail.jpg";
                    }
                } catch (Exception e) {
                    log.warn("Failed to generate thumbnail for video: {}", e.getMessage());
                    thumbnailUrl = "http://" + host + ":" + serverPort + contextPath + "/files/default-thumbnail.jpg";
                }
            }

            FileDocument fileDocument = FileDocument.builder()
                    .fileName(originalFilename)
                    .size(multipartFile.getSize())
                    .url(fileUrl)
                    .format(fileExtension.substring(1)) // Remove the dot
                    .resourceType(resourceType)
                    .build();

            // For images, you might want to get dimensions (optional)
            if ("image".equals(resourceType)) {
                // You can add image dimension detection here if needed
                // For now, we'll leave height and width as null
            }

            fileDocument = fileRepository.save(fileDocument);
            return fileMapper.toFileResponse(fileDocument);

        } catch (IOException e) {
            log.error("Failed to store file: {}", e.getMessage());
            throw new AppException(ErrorCode.ERROR_UPLOADING_FILE);
        }
    }

    @Override
    public List<FileResponse> storeMultipleFile(MultipartFile[] multipartFiles) {
        return Arrays.stream(multipartFiles).map(this::storeFile).toList();
    }

    @Override
    public FileResponse findDocumentById(String id) {
        FileDocument fileDocument = fileRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
        return fileMapper.toFileResponse(fileDocument);
    }

    @Override
    public Page<FileResponse> findAllDocument(Pageable pageable) {
        Page<FileDocument> fileDocuments = fileRepository.findAll(pageable);
        return fileDocuments.map(fileMapper::toFileResponse);
    }

    @Override
    public void deleteFile(String id) {
        FileDocument fileDocument = fileRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        try {
            // Extract the file path from the URL or use publicId
            String filename = fileDocument.getFileName();
            String uploader = extractUploaderFromUrl(fileDocument.getUrl());
            Path filePath = Paths.get(uploadDir, uploader, filename);

            // Delete the physical file
            Files.deleteIfExists(filePath);

            // Delete the document from database
            fileRepository.deleteById(fileDocument.getId());

        } catch (IOException e) {
            log.error("Failed to delete file: {}", e.getMessage());
            throw new AppException(ErrorCode.ERROR_UPLOADING_FILE);
        }
    }

    private String determineResourceType(String fileExtension) {
        if (fileExtension == null) return "raw";

        String ext = fileExtension.toLowerCase();
        if (ext.matches("\\.(jpg|jpeg|png|gif|bmp|webp)")) {
            return "image";
        } else if (ext.matches("\\.(mp4|avi|mov|wmv|flv|webm|mkv)")) {
            return "video";
        } else if (ext.matches("\\.(mp3|wav|ogg|aac|flac)")) {
            return "audio";
        }
        return "raw";
    }

    private String extractUploaderFromUrl(String url) {
        // Extract uploader from URL pattern: .../files/{uploader}/{filename}
        String[] parts = url.split("/");
        if (parts.length >= 3) {
            return parts[parts.length - 2]; // Second to last part should be uploader
        }
        return "unknown";
    }
}
