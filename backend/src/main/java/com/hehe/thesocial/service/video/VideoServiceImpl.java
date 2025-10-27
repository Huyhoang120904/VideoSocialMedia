package com.hehe.thesocial.service.video;


import com.hehe.thesocial.dto.request.video.*;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.dto.response.video.VideoUploadResponse;
import com.hehe.thesocial.entity.FileDocument;
import com.hehe.thesocial.entity.MetaData;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.entity.Video;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.entity.HashTag;
import com.hehe.thesocial.repository.FileRepository;
import com.hehe.thesocial.repository.HashTagRepository;
import com.hehe.thesocial.repository.MetaDataRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.repository.VideoRepository;
import com.hehe.thesocial.service.file.FileService;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    final MetaDataRepository metaDataRepository;
    final HashTagRepository hashTagRepository;
    
    @Value("${file.upload-dir:uploads}")
    String uploadDir;
    
    @Value("${server.host}")
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
    @Transactional
    public VideoUploadResponse uploadVideo(VideoUploadRequest request) {
        log.info("Uploading video: {}, title: {}, description: {}, has thumbnail: {}", 
                request.getFile().getOriginalFilename(), request.getTitle(), request.getDescription(), 
                request.getThumbnail() != null && !request.getThumbnail().isEmpty());

        validateVideoFile(request.getFile());

        // Store file using FileService
        FileResponse savedFile = fileService.storeFile(request.getFile());
        log.info("Video file stored with ID: {}", savedFile.getId());

        // Get the FileDocument for the video
        FileDocument videoFileDocument = fileRepository.findById(savedFile.getId())
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        // Get current user
        UserDetail uploader = getCurrentUser();

        // Process thumbnail if provided and store as FileDocument
        FileDocument thumbnailFileDocument = null;
        if (request.getThumbnail() != null && !request.getThumbnail().isEmpty()) {
            thumbnailFileDocument = processThumbnail(request.getThumbnail());
        }

        // Create MetaData entity with initial values
        MetaData metaData = MetaData.builder()
                .lovesCount(0L)
                .commentsCount(0L)
                .favouritesCount(0L)
                .viewsCount(0L)
                .sharesCount(0L)
                .build();
        
        metaData = metaDataRepository.save(metaData);
        log.info("MetaData created with ID: {}", metaData.getId());

        // Process hashTags if provided
        List<HashTag> hashTags = null;
        if (request.getHashTags() != null && !request.getHashTags().isEmpty()) {
            hashTags = processHashTags(request.getHashTags());
            log.info("Processed {} hashTags", hashTags.size());
        }

        // Create Video entity
        Video video = Video.builder()
                .uploader(uploader)
                .file(videoFileDocument)
                .thumbnail(thumbnailFileDocument)
                .duration(request.getDuration() != null ? request.getDuration() : 0.0)
                .title(request.getTitle() != null ? request.getTitle() : "")
                .description(request.getDescription() != null ? request.getDescription() : "")
                .metaData(metaData)
                .hashTags(hashTags)
                .build();

        video = videoRepository.save(video);
        log.info("Video entity created with ID: {} including MetaData", video.getId());

        // Convert to FileResponse
        FileResponse videoFileResponse = fileMapper.toFileResponseFromVideo(video);
        
        return VideoUploadResponse.builder()
                .video(videoFileResponse)
                .message("Video uploaded successfully")
                .uploadId(video.getId())
                .thumbnailUrl(videoFileResponse.getThumbnailUrl())
                .build();
    }


    @Override
    @Transactional
    public FileResponse updateVideo(String videoId, VideoUpdateRequest request) {
        log.info("Updating video with ID: {}", videoId);
        
        // Find the video by ID
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new AppException(ErrorCode.VIDEO_NOT_FOUND));
        
        // Update fields if provided
        updateVideoFields(video, request);
        
        // Handle thumbnail update if provided
        if (request.getThumbnail() != null && !request.getThumbnail().isEmpty()) {
            FileDocument thumbnailFileDocument = processThumbnail(request.getThumbnail());
            video.setThumbnail(thumbnailFileDocument);
        }
        
        // Save the updated video
        Video updatedVideo = videoRepository.save(video);
        log.info("Video updated successfully with ID: {}", updatedVideo.getId());
        
        // Return FileResponse from updated Video entity
        return fileMapper.toFileResponseFromVideo(updatedVideo);
    }

    // Private helper methods
    
    private void validateVideoFile(MultipartFile file) {
        if (!isVideo(file)) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }
    }
    
    private boolean isVideo(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("video/");
    }
    
    private FileDocument processThumbnail(MultipartFile thumbnail) {
        try {
            log.info("Processing thumbnail: {}, size: {}", 
                    thumbnail.getOriginalFilename(), thumbnail.getSize());
            
            String uploader = getCurrentUserId();
            
            // Create thumbnail directory
            String thumbnailDir = uploadDir + "/thumbnailImage/" + uploader;
            Path thumbnailPath = Paths.get(thumbnailDir);
            Files.createDirectories(thumbnailPath);
            
            // Generate unique filename
            String fileExtension = getFileExtension(thumbnail.getOriginalFilename());
            String uniqueFilename = UUID.randomUUID() + fileExtension;
            
            // Save thumbnail
            Path thumbnailFilePath = thumbnailPath.resolve(uniqueFilename);
            Files.copy(thumbnail.getInputStream(), thumbnailFilePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Create URL
            String host = (serverHost != null && !serverHost.isEmpty()) ? serverHost : "172.20.82.76";
            String thumbnailUrl = "http://" + host + ":" + serverPort + contextPath + 
                   "/files/thumbnailImage/" + uploader + "/" + uniqueFilename;
            
            // Create FileDocument for thumbnail
            FileDocument thumbnailFileDocument = FileDocument.builder()
                    .fileName(thumbnail.getOriginalFilename())
                    .size(thumbnail.getSize())
                    .url(thumbnailUrl)
                    .format(fileExtension.substring(1)) // Remove the dot
                    .resourceType("image")
                    .build();
            
            // Save and return FileDocument
            thumbnailFileDocument = fileRepository.save(thumbnailFileDocument);
            
            log.info("Thumbnail processed successfully: {}", thumbnailUrl);
            return thumbnailFileDocument;
        } catch (Exception e) {
            log.error("Failed to process thumbnail: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.ERROR_UPLOADING_FILE);
        }
    }
    
    private List<HashTag> processHashTags(List<String> hashTagNames) {
        List<HashTag> hashTags = new java.util.ArrayList<>();
        
        for (String name : hashTagNames) {
            if (name != null && !name.trim().isEmpty()) {
                String trimmedName = name.trim();
                
                // Check if hashtag already exists
                HashTag existingTag = hashTagRepository.findByName(trimmedName);
                
                if (existingTag != null) {
                    hashTags.add(existingTag);
                } else {
                    // Create new hashtag
                    HashTag newTag = HashTag.builder()
                            .name(trimmedName)
                            .viewCount(0)
                            .videoCount(0)
                            .build();
                    newTag = hashTagRepository.save(newTag);
                    hashTags.add(newTag);
                    log.info("Created new hashtag: {}", trimmedName);
                }
            }
        }
        
        return hashTags;
    }
    
    private void updateVideoFields(Video video, VideoUpdateRequest request) {
        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            log.info("Updating title from '{}' to '{}'", video.getTitle(), request.getTitle());
            video.setTitle(request.getTitle());
        }
        
        if (request.getDescription() != null) {
            log.info("Updating description from '{}' to '{}'", video.getDescription(), request.getDescription());
            video.setDescription(request.getDescription());
        }
    }
    
    private UserDetail getCurrentUser() {
        String userId = getCurrentUserId();
        return userDetailRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
    
    private String getCurrentUserId() {
        return org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
    }
    
    private String getFileExtension(String filename) {
        if (filename == null) return "";
        int lastDotIndex = filename.lastIndexOf(".");
        return lastDotIndex == -1 ? "" : filename.substring(lastDotIndex);
    }

}
