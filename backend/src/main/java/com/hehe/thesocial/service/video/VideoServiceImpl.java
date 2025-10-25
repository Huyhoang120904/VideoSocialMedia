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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VideoServiceImpl implements VideoService{
    FileRepository fileRepository;
    FileMapper fileMapper;
    FileService fileService;
    VideoRepository videoRepository;
    UserDetailRepository userDetailRepository;

    @Override
    public Page<FileResponse> getAllVideos(Pageable pageable) {
        log.info("Getting all videos with page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        
        // Query videos by resourceType
        Page<FileDocument> videos = fileRepository.findByResourceType("video", pageable);
        log.info("Found {} videos with resourceType='video'", videos.getTotalElements());
        
        // Debug: If no videos found, log all files to check data
        if (videos.getTotalElements() == 0) {
            List<FileDocument> allFiles = fileRepository.findAll();
            log.warn("No videos found! Total files in database: {}", allFiles.size());
            
            // Log first few files for debugging
            allFiles.stream().limit(5).forEach(file -> 
                log.debug("Sample file: {} | ResourceType: '{}' | Format: {}", 
                    file.getFileName(), file.getResourceType(), file.getFormat())
            );
        }
        
        return videos.map(fileMapper::toFileResponse);
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
        
        // Convert Video entities to FileResponse by extracting video_ref
        return videos.map(video -> {
            FileDocument videoFile = video.getVideo();
            return fileMapper.toFileResponse(videoFile);
        });
    }

    @Override
    public ApiResponse<FileResponse> uploadVideo(MultipartFile file, String title, String description) {
        log.info("Uploading video: {}, title: {}, description: {}", file.getOriginalFilename(), title, description);

        if (!isVideo(file)) {
            return ApiResponse.<FileResponse>builder()
                    .code(4000)
                    .message("File must be a video format")
                    .build();
        }

        // Store file using FileService
        FileResponse savedFile = fileService.storeFile(file);
        log.info("Video file stored with ID: {}", savedFile.getId());

        // Create Video entity
        FileDocument fileDocument = fileRepository.findById(savedFile.getId())
                .orElseThrow(() -> new RuntimeException("File not found after storage"));

        UserDetail uploader = userDetailRepository.findByUserId(
                org.springframework.security.core.context.SecurityContextHolder
                        .getContext().getAuthentication().getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Video video = Video.builder()
                .uploader(uploader)
                .video(fileDocument)
                .duration(0.0) // Default duration, can be updated later
                .build();

        videoRepository.save(video);
        log.info("Video entity created with ID: {}", video.getId());

        return ApiResponse.<FileResponse>builder()
                .result(savedFile)
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
