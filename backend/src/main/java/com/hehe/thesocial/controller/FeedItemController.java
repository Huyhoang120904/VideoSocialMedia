package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.feedItem.FeedItemSearchRequest;
import com.hehe.thesocial.dto.request.feedItem.FeedItemUploadRequest;
import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.dto.response.feedItem.FeedItemListResponse;
import com.hehe.thesocial.dto.response.feedItem.FeedItemUploadResponse;
import com.hehe.thesocial.dto.response.reportTicket.FeedItemReportSummaryResponse;
import com.hehe.thesocial.entity.enums.FeedItemType;
import com.hehe.thesocial.service.feedItem.FeedItemService;
import com.hehe.thesocial.util.AuthenticationHelper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
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
@Tag(name = "Feed Items", description = "Feed item management endpoints - videos and image slides")
public class FeedItemController extends BaseController {
    FeedItemService feedItemService;
    private final AuthenticationHelper authenticationHelper;

    @Operation(
            summary = "Get all feed items",
            description = "Retrieve paginated list of all feed items (videos and image slides). Public endpoint."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Feed items retrieved successfully",
                    content = @Content(schema = @Schema(implementation = FeedItemListResponse.class)))
    })
    @GetMapping
    public ResponseEntity<ApiResponse<FeedItemListResponse>> getAllFeedItems(
            @Parameter(description = "Pagination parameters") @PageableDefault(size = 10, page = 0) Pageable pageable) {

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

        return ok(response);
    }

    @Operation(
            summary = "Get feed items by user",
            description = "Retrieve paginated feed items uploaded by a specific user. Public endpoint."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Feed items retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/user/{userDetailId}")
    public ResponseEntity<ApiResponse<Page<FeedItemResponse>>> getFeedItemsByUserId(
            @Parameter(description = "User detail ID", required = true) @PathVariable String userDetailId,
            @Parameter(description = "Pagination parameters") @PageableDefault(size = 10, page = 0) Pageable pageable) {

        log.info("Fetching feed items for user detail ID: {} with page: {}, size: {}", userDetailId, pageable.getPageNumber(), pageable.getPageSize());

        return ok(feedItemService.getFeedItemsByUserDetailId(userDetailId, pageable));
    }

    @Operation(
            summary = "Get feed item by ID",
            description = "Retrieve a specific feed item by its ID. Public endpoint."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Feed item retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Feed item not found")
    })
    @GetMapping("/{feedItemId}")
    public ResponseEntity<ApiResponse<FeedItemResponse>> getFeedItemById(
            @Parameter(description = "Feed item ID", required = true) @PathVariable String feedItemId) {
        log.info("Fetching feed item with id {}", feedItemId);
        FeedItemResponse feedItem = feedItemService.getFeedItemById(feedItemId);

        return ok(feedItem);
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

        return ok(response, response.getMessage());
    }

    /**
     * Lấy danh sách feed item mà user đã love
     * GET /feed-items/loved
     */
    @GetMapping("/loved")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<FeedItemResponse>>> getLovedFeedItems(
            @PageableDefault(size = 10, page = 0) Pageable pageable) {
        String userDetailId = authenticationHelper.getCurrentUserDetail().getId();
        log.info("Fetching loved feed items for userDetail {} with page {}, size {}", userDetailId,
                pageable.getPageNumber(), pageable.getPageSize());

        Page<FeedItemResponse> lovedFeedItems = feedItemService.getLovedFeedItems(userDetailId, pageable);

        return ok(lovedFeedItems,
                lovedFeedItems.isEmpty() ? "No loved feed items found" : "Loved feed items retrieved successfully");
    }

    @Operation(
            summary = "Upload feed item",
            description = "Upload a new feed item (video or image slide). Requires authentication."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Feed item uploaded successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid file or request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
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

        return ok(response);
    }

    @Operation(
            summary = "Get reports for feed item",
            description = "Retrieve all reports submitted for a specific feed item. Requires ADMIN or MODERATOR role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Reports retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN or MODERATOR role"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Feed item not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{feedItemId}/reports")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ApiResponse<FeedItemReportSummaryResponse>> getReportsByFeedItemId(
            @Parameter(description = "Feed item ID", required = true) @PathVariable String feedItemId) {
        log.info("Fetching all reports for feedItem ID: {}", feedItemId);

        FeedItemReportSummaryResponse reports = feedItemService.getReportsByFeedItemId(feedItemId);

        return ok(reports,
                reports.getTotalReports() == 0 ? "No reports found for this feed item" : "Reports retrieved successfully");
    }

    @Operation(
            summary = "Disable feed item due to violation",
            description = "Disable a feed item that violates community guidelines. Sets violated=true and active=false. Requires ADMIN or MODERATOR role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Feed item disabled successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN or MODERATOR role"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Feed item not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{feedItemId}/disable")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ApiResponse<Void>> disableFeedItemByViolation(
            @Parameter(description = "Feed item ID", required = true) @PathVariable String feedItemId) {
        log.info("Disabling feedItem ID: {} due to violation", feedItemId);

        feedItemService.disableFeedItemByViolation(feedItemId);

        return okMessage("Feed item has been disabled due to violation");
    }

    @Operation(
            summary = "Get all violated feed items",
            description = "Retrieve paginated list of all feed items that have been flagged as violated. Requires ADMIN or MODERATOR role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Violated feed items retrieved successfully",
                    content = @Content(schema = @Schema(implementation = FeedItemListResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN or MODERATOR role")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/violated")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ApiResponse<FeedItemListResponse>> getViolatedFeedItems(
            @Parameter(description = "Pagination parameters") @PageableDefault(size = 10, page = 0) Pageable pageable) {

        log.info("Fetching violated feed items with page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());

        Page<FeedItemUploadResponse> violatedFeedItems = feedItemService.getViolatedFeedItems(pageable);

        FeedItemListResponse response = FeedItemListResponse.builder()
                .feedItems(violatedFeedItems)
                .message(violatedFeedItems.getTotalElements() == 0 ? "No violated feed items found" : "Violated feed items retrieved successfully")
                .totalElements(violatedFeedItems.getTotalElements())
                .totalPages(violatedFeedItems.getTotalPages())
                .currentPage(violatedFeedItems.getNumber())
                .pageSize(violatedFeedItems.getSize())
                .build();

        return ok(response, response.getMessage());
    }

    @Operation(
            summary = "Search feed items with dynamic filters",
            description = "Search feed items using keyword, status, uploader, report counts, date range and type filters. Requires ADMIN or MODERATOR role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Feed items retrieved successfully",
                    content = @Content(schema = @Schema(implementation = FeedItemListResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN or MODERATOR role")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MODERATOR')")
    public ResponseEntity<ApiResponse<FeedItemListResponse>> searchFeedItems(
            @RequestBody(required = false) FeedItemSearchRequest request,
            @Parameter(description = "Pagination parameters") @PageableDefault(size = 10, page = 0) Pageable pageable) {

        log.info("Searching feed items with pageable: page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());

        Page<FeedItemUploadResponse> feedItems = feedItemService.searchFeedItems(request, pageable);

        FeedItemListResponse response = FeedItemListResponse.builder()
                .feedItems(feedItems)
                .message(feedItems.getTotalElements() == 0 ? "No feed items match the search criteria" : "Feed items retrieved successfully")
                .totalElements(feedItems.getTotalElements())
                .totalPages(feedItems.getTotalPages())
                .currentPage(feedItems.getNumber())
                .pageSize(feedItems.getSize())
                .build();

        return ok(response, response.getMessage());
    }
}

