package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.response.notification.NotificationResponse;
import com.hehe.thesocial.service.notification.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Tag(name = "Notifications", description = "User notification endpoints - requires authentication")
public class NotificationController extends BaseController {

    NotificationService notificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(name = "unreadOnly", defaultValue = "false") boolean unreadOnly) {
        log.info("Fetching notifications. unreadOnly: {}, page: {}, size: {}",
                unreadOnly, pageable.getPageNumber(), pageable.getPageSize());

        Page<NotificationResponse> notifications = notificationService.getNotifications(pageable, unreadOnly);
        return ok(notifications, "Notifications retrieved successfully");
    }

    @PatchMapping("/{notificationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable String notificationId) {
        log.info("Marking notification {} as read", notificationId);
        notificationService.markNotificationAsRead(notificationId);
        return okMessage("Notification marked as read");
    }

    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        int totalUpdated = notificationService.markAllNotificationsAsRead();
        return okMessage(totalUpdated == 0
                ? "No unread notifications"
                : String.format("Marked %d notifications as read", totalUpdated));
    }
}




