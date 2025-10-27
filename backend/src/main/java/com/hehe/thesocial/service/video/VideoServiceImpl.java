package com.hehe.thesocial.service.video;


import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.entity.FileDocument;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.entity.Video;
import com.hehe.thesocial.entity.enums.FileType;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.repository.FileRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.repository.VideoRepository;
import com.hehe.thesocial.service.file.FileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class VideoServiceImpl implements VideoService{
    final FileRepository fileRepository;
    final FileMapper fileMapper;
    final FileService fileService;
    final VideoRepository videoRepository;
    final UserDetailRepository userDetailRepository;
    
    @Value("${file.upload-dir:uploads}")
    String uploadDir;
    
    @Value("${server.host:172.20.82.76}")
    String serverHost;
    
    @Value("${server.port:8082}")
    String serverPort;
    
    @Value("${server.servlet.context-path:/api/v1}")
    String contextPath;

    @Override
    public Page<FileResponse> getAllVideos(Pageable pageable) {
        log.info("Getting all videos with page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        
        // Query Video entities instead of FileDocument
        Page<Video> videos = videoRepository.findAll(pageable);
        log.info("Found {} videos", videos.getTotalElements());
        
        // Debug: If no videos found, log for debugging
        if (videos.getTotalElements() == 0) {
            log.warn("No videos found in database!");
        }
        
        // Use new mapper method that includes title and description
        return videos.map(fileMapper::toFileResponseFromVideo);
    }

    @Override
    public Page<FileResponse> getVideosByUserId(String userDetailId, Pageable pageable) {
        log.info("Getting videos for userDetail ID: {} with page: {}, size: {}", userDetailId, pageable.getPageNumber(), pageable.getPageSize());
        
        // Find UserDetail by ID directly
        UserDetail userDetail = userDetailRepository.findById(userDetailId)
                .orElseThrow(() -> new RuntimeException("UserDetail not found with ID: " + userDetailId));
        
        // Query videos by uploader
        Page<Video> videos = videoRepository.findByUploader(userDetail, pageable);
        log.info("Found {} videos for user: {}", videos.getTotalElements(), userDetail.getDisplayName());
        
        // Use new mapper method that includes title and description
        return videos.map(fileMapper::toFileResponseFromVideo);
    }

    @Override
    public ApiResponse<FileResponse> uploadVideo(MultipartFile file, String title, String description, MultipartFile thumbnail) {
        log.info("Uploading video: {}, title: {}, description: {}, has thumbnail: {}", 
                file.getOriginalFilename(), title, description, thumbnail != null && !thumbnail.isEmpty());

        if (!isVideo(file)) {
            return ApiResponse.<FileResponse>builder()
                    .code(4000)
                    .message("File must be a video format")
                    .build();
        }

        // Store file using FileService
        FileResponse savedFile = fileService.storeFile(file);
        log.info("Video file stored with ID: {}", savedFile.getId());

        // Get the FileDocument to update with thumbnail
        FileDocument fileDocument = fileRepository.findById(savedFile.getId())
                .orElseThrow(() -> new RuntimeException("File not found after storage"));

        // Handle thumbnail upload from frontend
        if (thumbnail != null && !thumbnail.isEmpty()) {
            try {
                log.info("Processing thumbnail from frontend: {}, size: {}", 
                        thumbnail.getOriginalFilename(), thumbnail.getSize());
                
                String uploader = org.springframework.security.core.context.SecurityContextHolder
                        .getContext().getAuthentication().getName();
                
                // Create thumbnail directory
                String thumbnailDir = uploadDir + "/thumbnailImage/" + uploader;
                Path thumbnailPath = Paths.get(thumbnailDir);
                Files.createDirectories(thumbnailPath);
                log.info("Thumbnail directory created: {}", thumbnailPath.toAbsolutePath());
                
                // Generate unique filename for thumbnail
                String originalFilename = thumbnail.getOriginalFilename();
                String fileExtension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String uniqueThumbnailFilename = UUID.randomUUID() + fileExtension;
                log.info("Generated thumbnail filename: {}", uniqueThumbnailFilename);
                
                // Save thumbnail to local storage
                Path thumbnailFilePath = thumbnailPath.resolve(uniqueThumbnailFilename);
                Files.copy(thumbnail.getInputStream(), thumbnailFilePath, StandardCopyOption.REPLACE_EXISTING);
                log.info("Thumbnail saved to: {}", thumbnailFilePath.toAbsolutePath());
                
                // Create thumbnail URL
                String host = (serverHost != null && !serverHost.isEmpty()) ? serverHost : "172.20.82.76";
                String thumbnailUrl = "http://" + host + ":" + serverPort + contextPath + 
                                    "/files/thumbnailImage/" + uploader + "/" + uniqueThumbnailFilename;
                
                // Update FileDocument with thumbnail URL (OVERWRITE auto-generated one)
                log.info("Updating FileDocument with custom thumbnail URL: {}", thumbnailUrl);
                log.info("Previous thumbnail URL: {}", fileDocument.getThumbnailUrl());
                fileDocument.setThumbnailUrl(thumbnailUrl);
                fileDocument = fileRepository.save(fileDocument);
                log.info("FileDocument updated, new thumbnail URL: {}", fileDocument.getThumbnailUrl());
                
                log.info("✅ Thumbnail uploaded successfully from frontend: {}", thumbnailUrl);
            } catch (Exception e) {
                log.error("❌ Failed to upload thumbnail from frontend: {}", e.getMessage(), e);
                // Continue without thumbnail - not a critical error
            }
        } else {
            log.warn("⚠️ No thumbnail provided from frontend, using auto-generated thumbnail");
            log.warn("Current thumbnail URL: {}", fileDocument.getThumbnailUrl());
        }

        UserDetail uploader = userDetailRepository.findByUserId(
                org.springframework.security.core.context.SecurityContextHolder
                        .getContext().getAuthentication().getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Video video = Video.builder()
                .uploader(uploader)
                .video(fileDocument)
                .duration(0.0) // Default duration, can be updated later
                .title(title != null ? title : "")
                .description(description != null ? description : "")
                .build();

        videoRepository.save(video);
        log.info("Video entity created with ID: {} with title: {}", video.getId(), title);

        // Return FileResponse from Video entity (includes title and description)
        FileResponse videoFileResponse = fileMapper.toFileResponseFromVideo(video);
        
        return ApiResponse.<FileResponse>builder()
                .result(videoFileResponse)
                .message("Video uploaded successfully")
                .build();
    }

    @Override
    public ApiResponse<String> uploadToTikTok(MultipartFile file) {
        log.info("Starting TikTok upload for file: {}", file.getOriginalFilename());

        if (!isVideo(file)) {
            return ApiResponse.<String>builder()
                    .code(4000)
                    .message("File must be a video format")
                    .build();
        }

        FileResponse savedFile = fileService.storeFile(file);
        log.info("File stored locally with ID: {}", savedFile.getId());

        return uploadById(savedFile.getId());
    }

    @Override
    public ApiResponse<String> uploadById(String fileId) {
        log.info("Uploading stored video to TikTok, fileId: {}", fileId);

        FileResponse fileResponse = fileService.findDocumentById(fileId);

        if (!FileType.VIDEO.equals(fileResponse.getFileType())) {
            return ApiResponse.<String>builder()
                    .code(4000)
                    .message("File must be a video to upload to TikTok")
                    .build();
        }

        String tikTokVideoId = simulateUpload(fileResponse, null, null, null);

        return ApiResponse.<String>builder()
                .result(tikTokVideoId)
                .message("Video successfully uploaded to TikTok")
                .build();
    }

    @Override
    public ApiResponse<String> uploadWithMeta(MultipartFile file, String title, String description, String hashtags) {
        log.info("Starting TikTok upload with metadata for file: {}", file.getOriginalFilename());

        if (!isVideo(file)) {
            return ApiResponse.<String>builder()
                    .code(4000)
                    .message("File must be a video format")
                    .build();
        }

        FileResponse savedFile = fileService.storeFile(file);
        log.info("File stored locally with ID: {}", savedFile.getId());

        String tikTokVideoId = simulateUpload(savedFile, title, description, hashtags);

        return ApiResponse.<String>builder()
                .result(tikTokVideoId)
                .message("Video with metadata successfully uploaded to TikTok")
                .build();
    }

    private boolean isVideo(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("video/");
    }

    private String simulateUpload(FileResponse fileResponse, String title, String description, String hashtags) {
        String tikTokVideoId = "tiktok_" + UUID.randomUUID().toString().substring(0, 8);

        log.info("Simulated TikTok upload - FileID: {}, URL: {}, TikTokID: {}",
                fileResponse.getId(), fileResponse.getUrl(), tikTokVideoId);

        if (title != null || description != null || hashtags != null) {
            log.info("Video metadata - Title: {}, Description: {}, Hashtags: {}",
                    title, description, hashtags);
        }

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        return tikTokVideoId;
    }
}
