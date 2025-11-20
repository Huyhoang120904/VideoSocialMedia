package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.response.metadata.ViewResponse;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.service.metadata.view.ViewService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/feed-items")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ViewController {

    ViewService viewService;

    /**
     * Increase view count for a feed item and record it in the user's watched list.
     * POST /feed-items/{id}/view
     */
    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<ViewResponse>> addView(@PathVariable String id) {
        log.info("Received request to add view for feedItem: {}", id);

        String userDetailId = getCurrentUserDetailId();
        log.info("UserDetail {} is viewing feedItem {}", userDetailId, id);

        ViewResponse response = viewService.addView(id, userDetailId);

        return ResponseEntity.ok(ApiResponse.<ViewResponse>builder()
                .result(response)
                .message("View recorded successfully")
                .build());
    }

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


