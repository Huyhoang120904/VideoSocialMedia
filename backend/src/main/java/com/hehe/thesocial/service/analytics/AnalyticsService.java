package com.hehe.thesocial.service.analytics;

import com.hehe.thesocial.dto.response.analytics.AnalyticsResponse;
import com.hehe.thesocial.entity.*;
import com.hehe.thesocial.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Slf4j
public class AnalyticsService {

    UserRepository userRepository;
    FileRepository fileRepository;
    VideoRepository videoRepository;
    UserInteractionRepository userInteractionRepository;
    CommentRepository commentRepository;
    ReportTicketRepository reportTicketRepository;

    public AnalyticsResponse getDashboardAnalytics() {
        log.info("Generating dashboard analytics");

        try {
            // Fetch all data
            List<User> allUsers = userRepository.findAll();
            List<FileDocument> allFiles = fileRepository.findAll();
            List<Video> allVideos = videoRepository.findAll();
            List<UserInteraction> allInteractions = userInteractionRepository.findAll();
            List<Comment> allComments = commentRepository.findAll();
            List<ReportTicket> allReports = reportTicketRepository.findAll();

            // Calculate time boundaries
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startOfToday = now.truncatedTo(ChronoUnit.DAYS);
            LocalDateTime startOfWeek = now.minus(7, ChronoUnit.DAYS);
            LocalDateTime startOfMonth = now.minus(30, ChronoUnit.DAYS);

            // User analytics
            long totalUsers = allUsers.size();
            long activeUsersToday = countCreatedAfter(allUsers, startOfToday);
            long newUsersThisWeek = countCreatedAfter(allUsers, startOfWeek);
            long newUsersThisMonth = countCreatedAfter(allUsers, startOfMonth);

            // Calculate users by role
            Map<String, Long> usersByRoleMap = allUsers.stream()
                    .flatMap(user -> user.getRoles().stream())
                    .collect(Collectors.groupingBy(Role::getRoleName, Collectors.counting()));

            List<AnalyticsResponse.UsersByRoleDto> usersByRole = usersByRoleMap.entrySet().stream()
                    .map(entry -> AnalyticsResponse.UsersByRoleDto.builder()
                            .role(entry.getKey())
                            .count(entry.getValue())
                            .build())
                    .collect(Collectors.toList());

            // Video analytics
            long totalVideos = allVideos.size();
            long videosUploadedToday = countCreatedAfter(allVideos, startOfToday);
            long videosUploadedThisWeek = countCreatedAfter(allVideos, startOfWeek);
            long videosUploadedThisMonth = countCreatedAfter(allVideos, startOfMonth);

            // Storage analytics from files
//            long totalStorageUsed = allFiles.stream()
//                    .mapToLong(file -> {
//                        try {
//                            return file.getBytes() != null ? file.getBytes() : 0L;
//                        } catch (Exception e) {
//                            return 0L;
//                        }
//                    })
//                    .sum();
//
//            long storageUsedThisMonth = allFiles.stream()
//                    .filter(file -> file.getCreatedAt() != null &&
//                            file.getCreatedAt().isAfter(startOfMonth))
//                    .mapToLong(file -> {
//                        try {
//                            return file.getBytes() != null ? file.getBytes() : 0L;
//                        } catch (Exception e) {
//                            return 0L;
//                        }
//                    })
//                    .sum();

            long totalStorageUsed = 0;
            long storageUsedThisMonth = 0;

            String formattedStorage = formatBytes(totalStorageUsed);

            // Videos by type/format
            Map<String, Long> videosByTypeMap = allFiles.stream()
                    .filter(file -> file.getResourceType() != null &&
                            file.getResourceType().equalsIgnoreCase("video"))
                    .collect(Collectors.groupingBy(
                            file -> file.getFormat() != null ? file.getFormat().toUpperCase() : "UNKNOWN",
                            Collectors.counting()
                    ));

            List<AnalyticsResponse.VideosByTypeDto> videosByType = videosByTypeMap.entrySet().stream()
                    .map(entry -> AnalyticsResponse.VideosByTypeDto.builder()
                            .type(entry.getKey())
                            .count(entry.getValue())
                            .totalSize(0L)
                            .build())
                    .collect(Collectors.toList());

            // Interaction analytics
            long totalInteractions = allInteractions.size();
            long interactionsToday = allInteractions.stream()
                    .filter(interaction -> interaction.getCreatedAt() != null &&
                            interaction.getCreatedAt().isAfter(startOfToday))
                    .count();

            Map<String, Long> interactionsByTypeMap = allInteractions.stream()
                    .collect(Collectors.groupingBy(
                            interaction -> interaction.getInteractionType() != null ?
                                    interaction.getInteractionType().name() : "UNKNOWN",
                            Collectors.counting()
                    ));

            List<AnalyticsResponse.InteractionsByTypeDto> interactionsByType =
                    interactionsByTypeMap.entrySet().stream()
                            .map(entry -> AnalyticsResponse.InteractionsByTypeDto.builder()
                                    .type(entry.getKey())
                                    .count(entry.getValue())
                                    .build())
                            .collect(Collectors.toList());

            // Content metrics
            long totalComments = allComments.size();
            long totalReports = allReports.size();
            long pendingReports = allReports.stream()
                    .filter(report -> !report.isAccepted())
                    .count();

            // Growth metrics
            long previousMonthUsers = countCreatedBetween(allUsers,
                    startOfMonth.minus(30, ChronoUnit.DAYS), startOfMonth);
            double userGrowthRate = calculateGrowthRate(newUsersThisMonth, previousMonthUsers);

            long previousMonthVideos = countCreatedBetween(allVideos,
                    startOfMonth.minus(30, ChronoUnit.DAYS), startOfMonth);
            double videoGrowthRate = calculateGrowthRate(videosUploadedThisMonth, previousMonthVideos);

            double engagementRate = totalUsers > 0 ?
                    (double) totalInteractions / totalUsers : 0.0;

            return AnalyticsResponse.builder()
                    .totalUsers(totalUsers)
                    .activeUsersToday(activeUsersToday)
                    .newUsersThisWeek(newUsersThisWeek)
                    .newUsersThisMonth(newUsersThisMonth)
                    .usersByRole(usersByRole)
                    .totalVideos(totalVideos)
                    .videosUploadedToday(videosUploadedToday)
                    .videosUploadedThisWeek(videosUploadedThisWeek)
                    .videosUploadedThisMonth(videosUploadedThisMonth)
                    .videosByType(videosByType)
                    .totalStorageUsed(totalStorageUsed)
                    .storageUsedThisMonth(storageUsedThisMonth)
                    .formattedStorageUsed(formattedStorage)
                    .totalInteractions(totalInteractions)
                    .interactionsToday(interactionsToday)
                    .interactionsByType(interactionsByType)
                    .totalComments(totalComments)
                    .totalReports(totalReports)
                    .pendingReports(pendingReports)
                    .userGrowthRate(userGrowthRate)
                    .videoGrowthRate(videoGrowthRate)
                    .engagementRate(engagementRate)
                    .build();

        } catch (Exception e) {
            log.error("Error generating analytics", e);
            // Return default analytics on error
            return AnalyticsResponse.builder()
                    .totalUsers(0L)
                    .activeUsersToday(0L)
                    .newUsersThisWeek(0L)
                    .newUsersThisMonth(0L)
                    .usersByRole(Collections.emptyList())
                    .totalVideos(0L)
                    .videosUploadedToday(0L)
                    .videosUploadedThisWeek(0L)
                    .videosUploadedThisMonth(0L)
                    .videosByType(Collections.emptyList())
                    .totalStorageUsed(0L)
                    .storageUsedThisMonth(0L)
                    .formattedStorageUsed("0 Bytes")
                    .totalInteractions(0L)
                    .interactionsToday(0L)
                    .interactionsByType(Collections.emptyList())
                    .totalComments(0L)
                    .totalReports(0L)
                    .pendingReports(0L)
                    .userGrowthRate(0.0)
                    .videoGrowthRate(0.0)
                    .engagementRate(0.0)
                    .build();
        }
    }

    public Map<String, Object> getUserAnalytics() {
        List<User> allUsers = userRepository.findAll();

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalUsers", allUsers.size());
        analytics.put("enabledUsers", allUsers.stream()
                .filter(user -> user.getEnable() != null && user.getEnable())
                .count());
        analytics.put("disabledUsers", allUsers.stream()
                .filter(user -> user.getEnable() == null || !user.getEnable())
                .count());

        return analytics;
    }

    public Map<String, Object> getVideoAnalytics() {
        List<Video> allVideos = videoRepository.findAll();
        List<FileDocument> allFiles = fileRepository.findAll();

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalVideos", allVideos.size());
        analytics.put("totalFiles", allFiles.size());

        return analytics;
    }

    private <T extends BaseDocument> long countCreatedAfter(List<T> items, LocalDateTime time) {
        return items.stream()
                .filter(item -> item.getCreatedAt() != null && item.getCreatedAt().isAfter(time))
                .count();
    }

    private <T extends BaseDocument> long countCreatedBetween(List<T> items,
                                                              LocalDateTime start,
                                                              LocalDateTime end) {
        return items.stream()
                .filter(item -> item.getCreatedAt() != null &&
                        item.getCreatedAt().isAfter(start) &&
                        item.getCreatedAt().isBefore(end))
                .count();
    }

    private double calculateGrowthRate(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return ((double) (current - previous) / previous) * 100.0;
    }

    private String formatBytes(long bytes) {
        if (bytes == 0) return "0 Bytes";

        String[] units = {"Bytes", "KB", "MB", "GB", "TB"};
        int unitIndex = 0;
        double size = bytes;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return String.format("%.2f %s", size, units[unitIndex]);
    }
}

