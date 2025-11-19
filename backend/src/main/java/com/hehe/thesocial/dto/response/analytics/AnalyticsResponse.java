package com.hehe.thesocial.dto.response.analytics;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AnalyticsResponse {
    
    // User metrics
    Long totalUsers;
    Long activeUsersToday;
    Long newUsersThisWeek;
    Long newUsersThisMonth;
    List<UsersByRoleDto> usersByRole;
    
    // Video metrics
    Long totalVideos;
    Long videosUploadedToday;
    Long videosUploadedThisWeek;
    Long videosUploadedThisMonth;
    List<VideosByTypeDto> videosByType;
    
    // Storage metrics
    Long totalStorageUsed;
    Long storageUsedThisMonth;
    String formattedStorageUsed;
    
    // Interaction metrics
    Long totalInteractions;
    Long interactionsToday;
    List<InteractionsByTypeDto> interactionsByType;
    
    // Content metrics
    Long totalComments;
    Long totalReports;
    Long pendingReports;
    
    // Growth metrics
    Double userGrowthRate;
    Double videoGrowthRate;
    Double engagementRate;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class UsersByRoleDto {
        String role;
        Long count;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class VideosByTypeDto {
        String type;
        Long count;
        Long totalSize;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class InteractionsByTypeDto {
        String type;
        Long count;
    }
}

