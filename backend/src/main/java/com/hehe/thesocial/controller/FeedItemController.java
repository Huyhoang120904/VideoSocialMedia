package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.feedItem.FeedItemUploadRequest;
import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.dto.response.feedItem.FeedItemListResponse;
import com.hehe.thesocial.dto.response.feedItem.FeedItemUploadResponse;
import com.hehe.thesocial.entity.enums.FeedItemType;
import com.hehe.thesocial.service.feedItem.FeedItemService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/feed-items")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FeedItemController {
    FeedItemService feedItemService;

    @GetMapping
    public ResponseEntity<ApiResponse<FeedItemListResponse>> getAllFeedItems(
            @PageableDefault(size = 10, page = 0) Pageable pageable) {

        log.info("Fetching all feed items with page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());

        Page<FeedItemUploadResponse> feedItems = feedItemService.getAllFeedItems(pageable);

        FeedItemListResponse response = FeedItemListResponse.builder()
                .feedItems(feedItems)
                .message(feedItems.getTotalElements() == 0 ? "No feed items found" : "Feed items retrieved successfully")
                .totalElements(feedItems.getTotalElements())
                .totalPages(feedItems.getTotalPages())
                .currentPage(feedItems.getNumber())
                .pageSize(feedItems.getSize())
                .build();

        return ResponseEntity.ok(ApiResponse.<FeedItemListResponse>builder()
                .result(response)
                .build());
    }

    @GetMapping("/user/{userDetailId}")
    public ResponseEntity<ApiResponse<FeedItemListResponse>> getFeedItemsByUserId(
            @PathVariable String userDetailId,
            @PageableDefault(size = 10, page = 0) Pageable pageable) {

        log.info("Fetching feed items for user detail ID: {} with page: {}, size: {}", userDetailId, pageable.getPageNumber(), pageable.getPageSize());

        Page<FeedItemUploadResponse> feedItems = feedItemService.getFeedItemsByUserDetailId(userDetailId, pageable);

        FeedItemListResponse response = FeedItemListResponse.builder()
                .feedItems(feedItems)
                .message(feedItems.getTotalElements() == 0 ? "No feed items found for this user" : "User feed items retrieved successfully")
                .totalElements(feedItems.getTotalElements())
                .totalPages(feedItems.getTotalPages())
                .currentPage(feedItems.getNumber())
                .pageSize(feedItems.getSize())
                .build();

        return ResponseEntity.ok(ApiResponse.<FeedItemListResponse>builder()
                .result(response)
                .message(response.getMessage())
                .build());
    }

    @GetMapping("/{feedItemId}")
    public ResponseEntity<ApiResponse<FeedItemResponse>> getFeedItemById(@PathVariable String feedItemId) {
        log.info("Fetching feed item with id {}", feedItemId);
        FeedItemResponse feedItem = feedItemService.getFeedItemById(feedItemId);

        return ResponseEntity.ok(ApiResponse.<FeedItemResponse>builder()
                .result(feedItem)
                .build());
    }

    @GetMapping("/type/{feedItemType}")
    public ResponseEntity<ApiResponse<FeedItemListResponse>> getFeedItemsByType(
            @PathVariable FeedItemType feedItemType,
            @PageableDefault(size = 10, page = 0) Pageable pageable) {

        log.info("Fetching feed items of type: {} with page: {}, size: {}", feedItemType, pageable.getPageNumber(), pageable.getPageSize());

        Page<FeedItemUploadResponse> feedItems = feedItemService.getFeedItemsByType(feedItemType, pageable);

        FeedItemListResponse response = FeedItemListResponse.builder()
                .feedItems(feedItems)
                .message(feedItems.getTotalElements() == 0 ? "No feed items found of this type" : "Feed items retrieved successfully")
                .totalElements(feedItems.getTotalElements())
                .totalPages(feedItems.getTotalPages())
                .currentPage(feedItems.getNumber())
                .pageSize(feedItems.getSize())
                .build();

        return ResponseEntity.ok(ApiResponse.<FeedItemListResponse>builder()
                .result(response)
                .message(response.getMessage())
                .build());
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<FeedItemUploadResponse>> uploadFeedItem(
            @RequestParam("feedItemType") FeedItemType feedItemType,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestParam(value = "hashTags", required = false) String hashTags,

            // Video-specific parameters
            @RequestParam(value = "videoFile", required = false) MultipartFile videoFile,
            @RequestParam(value = "duration", required = false) Double duration,

            // ImageSlide-specific parameters
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestParam(value = "captions", required = false) String captions) {

        log.info("Uploading feed item of type: {}, title: {}, description: {}",
                feedItemType, title, description);

        // Parse hashTags from comma-separated string
        List<String> hashTagList = null;
        if (hashTags != null && !hashTags.trim().isEmpty()) {
            hashTagList = Arrays.asList(hashTags.split(","));
        }

        FeedItemUploadRequest request = FeedItemUploadRequest.builder()
                .feedItemType(feedItemType)
                .title(title)
                .description(description)
                .thumbnail(thumbnail)
                .hashTags(hashTagList)
                .videoFile(videoFile)
                .duration(duration)
                .images(images)
                .captions(captions)
                .build();

        FeedItemUploadResponse response = feedItemService.uploadFeedItem(request);

        return ResponseEntity.ok(ApiResponse.<FeedItemUploadResponse>builder()
                .result(response)
                .build());
    }
}

