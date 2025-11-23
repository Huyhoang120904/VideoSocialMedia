package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.comment.CommentCreateRequest;
import com.hehe.thesocial.dto.response.comment.CommentCreateResponse;
import com.hehe.thesocial.dto.response.comment.CommentResponse;
import com.hehe.thesocial.dto.response.metadata.CommentActionResponse;
import com.hehe.thesocial.service.metadata.comment.CommentService;
import com.hehe.thesocial.util.AuthenticationHelper;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/feed-items")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Tag(name = "Comments", description = "Comment management endpoints - requires authentication")
public class CommentController {

    CommentService commentService;
    AuthenticationHelper authenticationHelper;

    /**
     * Thêm comment cho feed item
     * POST /feed-items/{feedItemId}/comments
     */
    @PostMapping("/{feedItemId}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CommentCreateResponse>> addComment(
            @PathVariable String feedItemId,
            @Valid @RequestBody CommentCreateRequest request) {
        log.info("Received request to add comment for feedItem: {}", feedItemId);

        String userDetailId = authenticationHelper.getCurrentUserDetail().getId();
        request.setUserDetailId(userDetailId);
        
        log.info("UserDetail {} is adding comment to feedItem {}", userDetailId, feedItemId);

        CommentCreateResponse response = commentService.addComment(feedItemId, request);

        return ResponseEntity.ok(ApiResponse.<CommentCreateResponse>builder()
                .result(response)
                .message("Comment added successfully")
                .build());
    }

    /**
     * Xóa comment
     * DELETE /feed-items/comments/{commentId}
     */
    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Boolean>> removeComment(@PathVariable String commentId) {
        log.info("Received request to remove comment: {}", commentId);

        String userDetailId = authenticationHelper.getCurrentUserDetail().getId();
        log.info("UserDetail {} is removing comment {}", userDetailId, commentId);

        boolean result = commentService.removeComment(commentId, userDetailId);

        return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                .result(result)
                .message("Comment removed successfully")
                .build());
    }

    /**
     * Like comment
     * POST /feed-items/comments/{commentId}/like
     */
    @PostMapping("/comments/{commentId}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CommentActionResponse>> likeComment(@PathVariable String commentId) {
        log.info("Received request to like comment: {}", commentId);

        String userDetailId = authenticationHelper.getCurrentUserDetail().getId();
        log.info("UserDetail {} is liking comment {}", userDetailId, commentId);

        CommentActionResponse response = commentService.likeComment(commentId, userDetailId);

        return ResponseEntity.ok(ApiResponse.<CommentActionResponse>builder()
                .result(response)
                .message("Comment liked successfully")
                .build());
    }

    /**
     * Unlike comment
     * DELETE /feed-items/comments/{commentId}/like
     */
    @DeleteMapping("/comments/{commentId}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CommentActionResponse>> unlikeComment(@PathVariable String commentId) {
        log.info("Received request to unlike comment: {}", commentId);

        String userDetailId = authenticationHelper.getCurrentUserDetail().getId();
        log.info("UserDetail {} is unliking comment {}", userDetailId, commentId);

        CommentActionResponse response = commentService.unlikeComment(commentId, userDetailId);

        return ResponseEntity.ok(ApiResponse.<CommentActionResponse>builder()
                .result(response)
                .message("Comment unliked successfully")
                .build());
    }

    /**
     * Dislike comment
     * POST /feed-items/comments/{commentId}/dislike
     */
    @PostMapping("/comments/{commentId}/dislike")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CommentActionResponse>> dislikeComment(@PathVariable String commentId) {
        log.info("Received request to dislike comment: {}", commentId);

        String userDetailId = authenticationHelper.getCurrentUserDetail().getId();
        log.info("UserDetail {} is disliking comment {}", userDetailId, commentId);

        CommentActionResponse response = commentService.dislikeComment(commentId, userDetailId);

        return ResponseEntity.ok(ApiResponse.<CommentActionResponse>builder()
                .result(response)
                .message("Comment disliked successfully")
                .build());
    }

    /**
     * Undislike comment
     * DELETE /feed-items/comments/{commentId}/dislike
     */
    @DeleteMapping("/comments/{commentId}/dislike")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CommentActionResponse>> undislikeComment(@PathVariable String commentId) {
        log.info("Received request to undislike comment: {}", commentId);

        String userDetailId = authenticationHelper.getCurrentUserDetail().getId();
        log.info("UserDetail {} is undisliking comment {}", userDetailId, commentId);

        CommentActionResponse response = commentService.undislikeComment(commentId, userDetailId);

        return ResponseEntity.ok(ApiResponse.<CommentActionResponse>builder()
                .result(response)
                .message("Comment undisliked successfully")
                .build());
    }

    /**
     * Lấy thông tin comment
     * GET /feed-items/comments/{commentId}
     */
    @GetMapping("/comments/{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CommentResponse>> getComment(@PathVariable String commentId) {
        log.info("Received request to get comment: {}", commentId);

        String userDetailId = authenticationHelper.getCurrentUserDetail().getId();
        CommentResponse response = commentService.getComment(commentId, userDetailId);

        return ResponseEntity.ok(ApiResponse.<CommentResponse>builder()
                .result(response)
                .message("Comment retrieved successfully")
                .build());
    }

    /**
     * Lấy danh sách comments của một FeedItem
     * GET /feed-items/{feedItemId}/comments
     */
    @GetMapping("/{feedItemId}/comments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> getCommentsByFeedItem(
            @PathVariable String feedItemId,
            @PageableDefault(page = 0, size = 20) Pageable pageable) {
        log.info("Received request to get comments for feedItem: {}, page: {}, size: {}", feedItemId,
                pageable.getPageNumber(), pageable.getPageSize());

        String userDetailId = authenticationHelper.getCurrentUserDetail().getId();
        Page<CommentResponse> response = commentService.getCommentsByFeedItem(feedItemId, userDetailId, pageable);

        return ResponseEntity.ok(ApiResponse.<Page<CommentResponse>>builder()
                .result(response)
                .message("Comments retrieved successfully")
                .build());
    }

}
