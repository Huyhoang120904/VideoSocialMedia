package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.repository.FileRepository;
import com.hehe.thesocial.service.video.VideoService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/videos")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VideoController {
    VideoService videoService;
    FileRepository fileRepository;
    FileMapper fileMapper;

    @GetMapping
    public ApiResponse<Page<FileResponse>> getAllVideos(
            @PageableDefault(size = 10, page = 0) Pageable pageable) {
        
        Page<FileResponse> videos = videoService.getAllVideos(pageable);
        
        return ApiResponse.<Page<FileResponse>>builder()
                .result(videos)
                .message(videos.getTotalElements() == 0 ? "No videos found" : "Videos retrieved successfully")
                .build();
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<Page<FileResponse>> getVideosByUserId(
            @PathVariable String userId,
            @PageableDefault(size = 10, page = 0) Pageable pageable) {
        
        Page<FileResponse> videos = videoService.getVideosByUserId(userId, pageable);
        
        return ApiResponse.<Page<FileResponse>>builder()
                .result(videos)
                .message(videos.getTotalElements() == 0 ? "No videos found for this user" : "User videos retrieved successfully")
                .build();
    }

    @PostMapping("/upload")
    public ApiResponse<FileResponse> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail) {
        return videoService.uploadVideo(file, title, description, thumbnail);
    }

    @PostMapping("/tiktok")
    public ApiResponse<String> uploadToTikTok(@RequestParam("file") MultipartFile file) {
        return videoService.uploadToTikTok(file);
    }

    @PostMapping("/{id}/tiktok")
    public ApiResponse<String> uploadById(@PathVariable("id") String id) {
        return videoService.uploadById(id);
    }

    @PostMapping("/tiktok/meta")
    public ApiResponse<String> uploadWithMeta(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "hashtags", required = false) String hashtags) {
        return videoService.uploadWithMeta(file, title, description, hashtags);
    }

    @GetMapping("/debug-quick")
    public String debugQuick() {
        long totalFiles = fileRepository.count();
        long videoFiles = fileRepository.findByResourceType("video", org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements();
        return String.format("Total files: %d, Video files: %d", totalFiles, videoFiles);
    }

}
