package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.response.analytics.AnalyticsResponse;
import com.hehe.thesocial.service.analytics.AnalyticsService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/analytics")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Slf4j
public class AnalyticsController {
    
    AnalyticsService analyticsService;

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

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getUserAnalytics() {
        log.info("Fetching user analytics");
        return ResponseEntity.ok(ApiResponse.builder()
                .result(analyticsService.getUserAnalytics())
                .message("User analytics retrieved successfully")
                .build());
    }

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

