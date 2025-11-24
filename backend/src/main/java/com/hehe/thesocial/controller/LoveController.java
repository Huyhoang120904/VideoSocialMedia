package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.dto.response.metadata.LoveResponse;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.service.metadata.love.LoveService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.access.prepost.PreAuthorize;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/feed-items")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Tag(name = "Love", description = "Like/love feed items - requires authentication")
public class LoveController extends BaseController {

    LoveService loveService;

    /**
     * Thêm love cho feed item
     * POST /feed-items/{id}/love
     */
    @PostMapping("/{id}/love")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<LoveResponse>> addLove(@PathVariable String id) {
        log.info("Received request to add love for feedItem: {}", id);

        // Lấy userDetailId từ JWT authentication context
        String userDetailId = getCurrentUserDetailId();
        log.info("UserDetail {} is adding love to feedItem {}", userDetailId, id);

        LoveResponse response = loveService.addLove(id, userDetailId);

        return ok(response, "Love added successfully");
    }

    /**
     * Xóa love khỏi feed item
     * DELETE /feed-items/{id}/love
     */
    @DeleteMapping("/{id}/love")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<LoveResponse>> removeLove(@PathVariable String id) {
        log.info("Received request to remove love for feedItem: {}", id);

        String userDetailId = getCurrentUserDetailId();
        log.info("UserDetail {} is removing love from feedItem {}", userDetailId, id);

        LoveResponse response = loveService.removeLove(id, userDetailId);

        return ok(response, "Love removed successfully");
    }

    /**
     * Kiểm tra trạng thái love của user cho feed item
     * GET /feed-items/{id}/love
     */
    @GetMapping("/{id}/love")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<LoveResponse>> checkLoveStatus(@PathVariable String id) {
        log.info("Received request to check love status for feedItem: {}", id);

        String userDetailId = getCurrentUserDetailId();
        log.info("Checking love status for userDetail {} on feedItem {}", userDetailId, id);

        LoveResponse response = loveService.checkLoveStatus(id, userDetailId);

        return ok(response, "Love status retrieved successfully");
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
