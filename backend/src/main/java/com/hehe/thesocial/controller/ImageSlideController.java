package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.imageSlide.ImageSlideUploadRequest;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.dto.response.imageSlide.ImageSlideUploadResponse;
import com.hehe.thesocial.dto.response.imageSlide.ImageSlideListResponse;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.repository.FileRepository;
import com.hehe.thesocial.service.imageSlide.ImageSlideService;
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

import jakarta.validation.Valid;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/image-slides")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ImageSlideController {
    ImageSlideService imageSlideService;
    FileRepository fileRepository;
    FileMapper fileMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<ImageSlideListResponse>> getAllImageSlides(
            @PageableDefault(size = 10, page = 0) Pageable pageable) {
        
        log.info("Fetching all image slides with page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        
        Page<FileResponse> imageSlides = imageSlideService.getAllImageSlides(pageable);
        
        ImageSlideListResponse response = ImageSlideListResponse.builder()
                .imageSlides(imageSlides)
                .message(imageSlides.getTotalElements() == 0 ? "No image slides found" : "Image slides retrieved successfully")
                .totalElements(imageSlides.getTotalElements())
                .totalPages(imageSlides.getTotalPages())
                .currentPage(imageSlides.getNumber())
                .pageSize(imageSlides.getSize())
                .build();
        
        return ResponseEntity.ok(ApiResponse.<ImageSlideListResponse>builder()
                .result(response)
                .message(response.getMessage())
                .build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<ImageSlideListResponse>> getImageSlidesByUserId(
            @PathVariable String userId,
            @PageableDefault(size = 10, page = 0) Pageable pageable) {
        
        log.info("Fetching image slides for user ID: {} with page: {}, size: {}", userId, pageable.getPageNumber(), pageable.getPageSize());
        
        Page<FileResponse> imageSlides = imageSlideService.getImageSlidesByUserId(userId, pageable);
        
        ImageSlideListResponse response = ImageSlideListResponse.builder()
                .imageSlides(imageSlides)
                .message(imageSlides.getTotalElements() == 0 ? "No image slides found for this user" : "User image slides retrieved successfully")
                .totalElements(imageSlides.getTotalElements())
                .totalPages(imageSlides.getTotalPages())
                .currentPage(imageSlides.getNumber())
                .pageSize(imageSlides.getSize())
                .build();
        
        return ResponseEntity.ok(ApiResponse.<ImageSlideListResponse>builder()
                .result(response)
                .message(response.getMessage())
                .build());
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ImageSlideUploadResponse>> uploadImageSlide(
            @RequestParam("images") List<org.springframework.web.multipart.MultipartFile> images,
            @RequestParam(value = "captions", required = false) String captions,
            @RequestParam(value = "thumbnail", required = false) org.springframework.web.multipart.MultipartFile thumbnail,
            @RequestParam(value = "hashTags", required = false) String hashTags) {
        
        log.info("Uploading image slide with {} images, captions: {}", images.size(), captions);
        
        // Parse hashTags from comma-separated string
        List<String> hashTagList = null;
        if (hashTags != null && !hashTags.trim().isEmpty()) {
            hashTagList = Arrays.asList(hashTags.split(","));
        }
        
        ImageSlideUploadRequest request = ImageSlideUploadRequest.builder()
                .images(images)
                .captions(captions)
                .thumbnail(thumbnail)
                .hashTags(hashTagList)
                .build();
        
        ImageSlideUploadResponse response = imageSlideService.uploadImageSlide(request);
        
        return ResponseEntity.ok(ApiResponse.<ImageSlideUploadResponse>builder()
                .result(response)
                .message(response.getMessage())
                .build());
    }
}

