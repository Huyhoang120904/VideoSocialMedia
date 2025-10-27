package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.service.feed.FeedService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/feed")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FeedController {
    
    FeedService feedService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FeedItemResponse>>> getAllFeedItems(
            @PageableDefault(size = 10, page = 0) Pageable pageable) {
        
        log.info("Fetching all feed items with page: {}, size: {}", 
                pageable.getPageNumber(), pageable.getPageSize());
        
        Page<FeedItemResponse> feedItems = feedService.getAllFeedItems(pageable);
        
        return ResponseEntity.ok(ApiResponse.<Page<FeedItemResponse>>builder()
                .result(feedItems)
                .message(feedItems.getTotalElements() == 0 ? "No feed items found" : "Feed items retrieved successfully")
                .build());
    }
}
