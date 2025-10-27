package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.video.*;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.dto.response.video.*;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.repository.FileRepository;
import com.hehe.thesocial.service.video.VideoService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/videos")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VideoController {
    VideoService videoService;
    FileRepository fileRepository;
    FileMapper fileMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<VideoListResponse>> getAllVideos(
            @PageableDefault(size = 10, page = 0) Pageable pageable) {
        
        log.info("Fetching all videos with page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        
        Page<FileResponse> videos = videoService.getAllVideos(pageable);
        
        VideoListResponse response = VideoListResponse.builder()
                .videos(videos)
                .message(videos.getTotalElements() == 0 ? "No videos found" : "Videos retrieved successfully")
                .totalElements(videos.getTotalElements())
                .totalPages(videos.getTotalPages())
                .currentPage(videos.getNumber())
                .pageSize(videos.getSize())
                .build();
        
        return ResponseEntity.ok(ApiResponse.<VideoListResponse>builder()
                .result(response)
                .message(response.getMessage())
                .build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<VideoListResponse>> getVideosByUserId(
            @PathVariable String userId,
            @PageableDefault(size = 10, page = 0) Pageable pageable) {
        
        log.info("Fetching videos for user ID: {} with page: {}, size: {}", userId, pageable.getPageNumber(), pageable.getPageSize());
        
        Page<FileResponse> videos = videoService.getVideosByUserId(userId, pageable);
        
        VideoListResponse response = VideoListResponse.builder()
                .videos(videos)
                .message(videos.getTotalElements() == 0 ? "No videos found for this user" : "User videos retrieved successfully")
                .totalElements(videos.getTotalElements())
                .totalPages(videos.getTotalPages())
                .currentPage(videos.getNumber())
                .pageSize(videos.getSize())
                .build();
        
        return ResponseEntity.ok(ApiResponse.<VideoListResponse>builder()
                .result(response)
                .message(response.getMessage())
                .build());
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<VideoUploadResponse>> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestParam(value = "duration", required = false) Double duration,
            @RequestParam(value = "hashTags", required = false) String hashTags) {
        
        log.info("Uploading video: {}, title: {}, description: {}", 
                file.getOriginalFilename(), title, description);
        
        // Parse hashTags from comma-separated string
        java.util.List<String> hashTagList = null;
        if (hashTags != null && !hashTags.trim().isEmpty()) {
            hashTagList = java.util.Arrays.asList(hashTags.split(","));
        }
        
        VideoUploadRequest request = VideoUploadRequest.builder()
                .file(file)
                .title(title)
                .description(description)
                .thumbnail(thumbnail)
                .duration(duration)
                .hashTags(hashTagList)
                .build();
        
        VideoUploadResponse response = videoService.uploadVideo(request);
        
        return ResponseEntity.ok(ApiResponse.<VideoUploadResponse>builder()
                .result(response)
                .message(response.getMessage())
                .build());
    }

    @PutMapping("/{videoId}")
    public ResponseEntity<ApiResponse<FileResponse>> updateVideo(
            @PathVariable String videoId,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail) {
        
        log.info("Updating video with ID: {}", videoId);
        
        VideoUpdateRequest request = VideoUpdateRequest.builder()
                .title(title)
                .description(description)
                .thumbnail(thumbnail)
                .build();
        
        FileResponse response = videoService.updateVideo(videoId, request);
        
        return ResponseEntity.ok(ApiResponse.<FileResponse>builder()
                .result(response)
                .message("Video updated successfully")
                .build());
    }

}
