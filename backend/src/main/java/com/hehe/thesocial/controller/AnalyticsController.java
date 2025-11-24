package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.response.analytics.AnalyticsResponse;
import com.hehe.thesocial.service.analytics.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/analytics")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Slf4j
@Tag(name = "Analytics", description = "Analytics and dashboard endpoints - ADMIN only")
public class AnalyticsController {
    
    AnalyticsService analyticsService;

    @Operation(
            summary = "Get dashboard analytics",
            description = "Retrieve comprehensive dashboard analytics including user stats, content stats, and engagement metrics. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Analytics retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getDashboardAnalytics() {
        log.info("Fetching dashboard analytics");
        AnalyticsResponse analytics = analyticsService.getDashboardAnalytics();
        return ResponseEntity.ok(ApiResponse.<AnalyticsResponse>builder()
                .result(analytics)
                .message("Analytics retrieved successfully")
                .build());
    }

    @Operation(
            summary = "Get user analytics",
            description = "Retrieve user-related analytics and statistics. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "User analytics retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getUserAnalytics() {
        log.info("Fetching user analytics");
        return ResponseEntity.ok(ApiResponse.builder()
                .result(analyticsService.getUserAnalytics())
                .message("User analytics retrieved successfully")
                .build());
    }

    @Operation(
            summary = "Get video analytics",
            description = "Retrieve video content analytics and statistics. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Video analytics retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/videos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getVideoAnalytics() {
        log.info("Fetching video analytics");
        return ResponseEntity.ok(ApiResponse.builder()
                .result(analyticsService.getVideoAnalytics())
                .message("Video analytics retrieved successfully")
                .build());
    }
}

