package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.comment.CommentCreateRequest;
import com.hehe.thesocial.dto.response.comment.CommentCreateResponse;
import com.hehe.thesocial.dto.response.comment.CommentResponse;
import com.hehe.thesocial.dto.response.metadata.CommentActionResponse;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.service.metadata.comment.CommentService;
import com.hehe.thesocial.util.AuthenticationHelper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/feed-items")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CommentController {
    AuthenticationHelper authenticationHelper;
    CommentService commentService;

    /**
     * Thêm comment cho feed item
     * POST /feed-items/{feedItemId}/comments
     */
    @PostMapping("/{feedItemId}/comments")
    public ResponseEntity<ApiResponse<CommentCreateResponse>> addComment(
            @PathVariable String feedItemId,
            @RequestBody CommentCreateRequest request) {
        log.info("Received request to add comment for feedItem: {}", feedItemId);

        String userDetailId = getCurrentUserDetailId();
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
    public ResponseEntity<ApiResponse<Boolean>> removeComment(@PathVariable String commentId) {
        log.info("Received request to remove comment: {}", commentId);

        String userDetailId = getCurrentUserDetailId();
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
    public ResponseEntity<ApiResponse<CommentActionResponse>> likeComment(@PathVariable String commentId) {
        log.info("Received request to like comment: {}", commentId);

        String userDetailId = getCurrentUserDetailId();
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
    public ResponseEntity<ApiResponse<CommentActionResponse>> unlikeComment(@PathVariable String commentId) {
        log.info("Received request to unlike comment: {}", commentId);

        String userDetailId = getCurrentUserDetailId();
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
    public ResponseEntity<ApiResponse<CommentActionResponse>> dislikeComment(@PathVariable String commentId) {
        log.info("Received request to dislike comment: {}", commentId);

        String userDetailId = getCurrentUserDetailId();
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
    public ResponseEntity<ApiResponse<CommentActionResponse>> undislikeComment(@PathVariable String commentId) {
        log.info("Received request to undislike comment: {}", commentId);

        String userDetailId = getCurrentUserDetailId();
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
    public ResponseEntity<ApiResponse<CommentResponse>> getComment(@PathVariable String commentId) {
        log.info("Received request to get comment: {}", commentId);

        String userDetailId = getCurrentUserDetailId();
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

    /**
     * Lấy danh sách replies của một comment
     * GET /feed-items/comments/{commentId}/replies
     */
    @GetMapping("/comments/{commentId}/replies")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> getRepliesByCommentId(
            @PathVariable String commentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Received request to get replies for comment: {}, page: {}, size: {}", commentId, page, size);

        String userDetailId = getCurrentUserDetailId();
        Page<CommentResponse> response = commentService.getRepliesByCommentId(commentId, userDetailId, page, size);

        return ResponseEntity.ok(ApiResponse.<Page<CommentResponse>>builder()
                .result(response)
                .message("Replies retrieved successfully")
                .build());
    }

    /**
     * Lấy userDetailId từ JWT token trong Spring Security context
     */
    private String getCurrentUserDetailId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            String userDetailId = jwt.getClaim("userDetailId");
            
            if (userDetailId == null) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
            
            return userDetailId;
        }
        
        throw new AppException(ErrorCode.UNAUTHENTICATED);
    }
}
