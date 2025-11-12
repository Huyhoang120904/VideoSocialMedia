package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.response.metadata.LoveResponse;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.service.metadata.love.LoveService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/feed-items")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LoveController {

    LoveService loveService;

    /**
     * Thêm love cho feed item
     * POST /feed-items/{id}/love
     */
    @PostMapping("/{id}/love")
    public ResponseEntity<ApiResponse<LoveResponse>> addLove(@PathVariable String id) {
        log.info("Received request to add love for feedItem: {}", id);

        // Lấy userDetailId từ JWT authentication context
        String userDetailId = getCurrentUserDetailId();
        log.info("UserDetail {} is adding love to feedItem {}", userDetailId, id);

        LoveResponse response = loveService.addLove(id, userDetailId);

        return ResponseEntity.ok(ApiResponse.<LoveResponse>builder()
                .result(response)
                .message("Love added successfully")
                .build());
    }

    /**
     * Xóa love khỏi feed item
     * DELETE /feed-items/{id}/love
     */
    @DeleteMapping("/{id}/love")
    public ResponseEntity<ApiResponse<LoveResponse>> removeLove(@PathVariable String id) {
        log.info("Received request to remove love for feedItem: {}", id);

        String userDetailId = getCurrentUserDetailId();
        log.info("UserDetail {} is removing love from feedItem {}", userDetailId, id);

        LoveResponse response = loveService.removeLove(id, userDetailId);

        return ResponseEntity.ok(ApiResponse.<LoveResponse>builder()
                .result(response)
                .message("Love removed successfully")
                .build());
    }

    /**
     * Kiểm tra trạng thái love của user cho feed item
     * GET /feed-items/{id}/love
     */
    @GetMapping("/{id}/love")
    public ResponseEntity<ApiResponse<LoveResponse>> checkLoveStatus(@PathVariable String id) {
        log.info("Received request to check love status for feedItem: {}", id);

        String userDetailId = getCurrentUserDetailId();
        log.info("Checking love status for userDetail {} on feedItem {}", userDetailId, id);

        LoveResponse response = loveService.checkLoveStatus(id, userDetailId);

        return ResponseEntity.ok(ApiResponse.<LoveResponse>builder()
                .result(response)
                .message("Love status retrieved successfully")
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
