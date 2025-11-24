package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.dto.response.feedItem.FeedItemListResponse;
import com.hehe.thesocial.service.feed.FeedService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/feed")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Tag(name = "Feed", description = "Feed endpoints for browsing content")
public class FeedController {
    
    FeedService feedService;

    @Operation(
            summary = "Get all feed items",
            description = "Retrieve paginated list of all feed items. Public endpoint."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Feed items retrieved successfully")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<Page<FeedItemResponse>>> getAllFeedItems(
            @Parameter(description = "Pagination parameters") @PageableDefault(size = 10, page = 0) Pageable pageable) {
        
        log.info("Fetching all feed items with page: {}, size: {}", 
                pageable.getPageNumber(), pageable.getPageSize());
        
        Page<FeedItemResponse> feedItems = feedService.getAllFeedItems(pageable);
        
        return ResponseEntity.ok(ApiResponse.<Page<FeedItemResponse>>builder()
                .result(feedItems)
                .message(feedItems.getTotalElements() == 0 ? "No feed items found" : "Feed items retrieved successfully")
                .build());
    }
    @Operation(
            summary = "Get personalized feed",
            description = "Retrieve personalized feed items based on user preferences. Requires authentication."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Personalized feed retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/personal")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<FeedItemResponse>>> getPersonalizedFeed(
            @Parameter(description = "Pagination parameters") @PageableDefault(size = 10, page = 0) Pageable pageable) {

        log.info("Fetching personalized feed items with page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        Page<FeedItemResponse> feedItems = feedService.getPersonalizedFeed(pageable);

        return ResponseEntity.ok(ApiResponse.<Page<FeedItemResponse>>builder()
                .result(feedItems)
                .build());
    }

    @Operation(
            summary = "Get explore feed",
            description = "Retrieve trending and discovery feed items. Requires authentication."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Explore feed retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/explore")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<FeedItemResponse>>> getExploreFeed(
            @Parameter(description = "Pagination parameters") @PageableDefault(size = 10, page = 0) Pageable pageable) {

        log.info("Fetching personalized feed items with page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

//        Page<FeedItemResponse> feedItems = feedService.getExploreFeed(pageable);

        Page<FeedItemResponse> feedItems = feedService.getPersonalizedFeed(pageable);

        return ResponseEntity.ok(ApiResponse.<Page<FeedItemResponse>>builder()
                .result(feedItems)
                .build());
    }

    @Operation(
            summary = "Get following feed",
            description = "Retrieve feed items from users you follow. Requires authentication."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Following feed retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/following")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<FeedItemResponse>>> getFollowingFeed(
            @Parameter(description = "Pagination parameters") @PageableDefault(size = 10, page = 0) Pageable pageable) {

        log.info("Fetching personalized feed items with page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        Page<FeedItemResponse> feedItems = feedService.getFollowingFeed(pageable);

        return ResponseEntity.ok(ApiResponse.<Page<FeedItemResponse>>builder()
                .result(feedItems)
                .build());
    }

}
