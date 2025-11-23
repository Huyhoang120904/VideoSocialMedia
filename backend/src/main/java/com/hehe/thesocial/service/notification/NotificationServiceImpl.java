package com.hehe.thesocial.service.notification;

import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.dto.response.notification.NotificationActorResponse;
import com.hehe.thesocial.dto.response.notification.NotificationResponse;
import com.hehe.thesocial.entity.*;
import com.hehe.thesocial.entity.enums.NotificationType;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.mapper.notification.NotificationMapper;
import com.hehe.thesocial.repository.NotificationRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.util.AuthenticationHelper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    static final String NOTIFICATION_DESTINATION = "/queue/notifications";
    NotificationRepository notificationRepository;
    NotificationMapper notificationMapper;
    UserDetailRepository userDetailRepository;
    SimpMessagingTemplate simpMessagingTemplate;
    FileMapper fileMapper;
    AuthenticationHelper authenticationHelper;

    @Override
    @Transactional
    public void notifyCommentOnFeedItem(FeedItem feedItem, Comment comment, UserDetail commenter) {
        if (feedItem == null || feedItem.getUploader() == null || commenter == null) {
            log.debug("Skipping comment notification due to missing data");
            return;
        }

        String recipientId = feedItem.getUploader().getId();
        if (!StringUtils.hasText(recipientId) || recipientId.equals(commenter.getId())) {
            return;
        }

        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .actorId(commenter.getId())
                .notificationType(NotificationType.COMMENT)
                .title("New comment on your video")
                .body(String.format("%s commented on \"%s\"",
                        resolveDisplayName(commenter),
                        StringUtils.hasText(feedItem.getTitle()) ? feedItem.getTitle() : "your video"))
                .previewText(truncate(comment != null ? comment.getContent() : null))
                .feedItemId(feedItem.getId())
                .commentId(comment != null ? comment.getId() : null)
                .build();

        Notification saved = notificationRepository.save(notification);
        sendWebSocketEvent(saved, commenter);
    }

    @Override
    @Transactional
    public void notifyLikeOnFeedItem(FeedItem feedItem, UserDetail liker) {
        if (feedItem == null || feedItem.getUploader() == null || liker == null) {
            log.debug("Skipping like notification due to missing data");
            return;
        }

        String recipientId = feedItem.getUploader().getId();
        if (!StringUtils.hasText(recipientId) || recipientId.equals(liker.getId())) {
            return;
        }

        Notification notification = Notification.builder()
                .recipientId(recipientId)
                .actorId(liker.getId())
                .notificationType(NotificationType.LIKE)
                .title("New like on your video")
                .body(String.format("%s liked \"%s\"",
                        resolveDisplayName(liker),
                        StringUtils.hasText(feedItem.getTitle()) ? feedItem.getTitle() : "your video"))
                .previewText(null)
                .feedItemId(feedItem.getId())
                .build();

        Notification saved = notificationRepository.save(notification);
        sendWebSocketEvent(saved, liker);
    }

    @Override
    @Transactional
    public void notifyConversationMessage(Set<String> participantIds, ChatMessage message, UserDetail sender) {
        if (message == null || sender == null || participantIds == null || participantIds.isEmpty()) {
            return;
        }

        for (String participantId : participantIds) {
            if (!StringUtils.hasText(participantId) || participantId.equals(sender.getId())) {
                continue;
            }

            Notification notification = Notification.builder()
                    .recipientId(participantId)
                    .actorId(sender.getId())
                    .notificationType(NotificationType.MESSAGE)
                    .title("New message")
                    .body(String.format("%s sent you a message", resolveDisplayName(sender)))
                    .previewText(resolveMessagePreview(message))
                    .conversationId(message.getConversationId())
                    .messageId(message.getId())
                    .build();

            Notification saved = notificationRepository.save(notification);
            sendWebSocketEvent(saved, sender);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(Pageable pageable, boolean unreadOnly) {
        UserDetail currentUser = authenticationHelper.getCurrentUserDetail();
        Page<Notification> notifications = unreadOnly
                ? notificationRepository.findByRecipientIdAndReadFalseOrderByCreatedAtDesc(currentUser.getId(), pageable)
                : notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId(), pageable);

        Map<String, UserDetail> actors = loadActors(notifications.getContent());
        return notifications.map(notification -> mapToResponse(notification, actors.get(notification.getActorId())));
    }

    @Override
    @Transactional
    public void markNotificationAsRead(String notificationId) {
        UserDetail currentUser = authenticationHelper.getCurrentUserDetail();
        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    @Override
    @Transactional
    public int markAllNotificationsAsRead() {
        UserDetail currentUser = authenticationHelper.getCurrentUserDetail();
        List<Notification> unreadNotifications = notificationRepository.findByRecipientIdAndReadFalse(currentUser.getId());

        if (unreadNotifications.isEmpty()) {
            return 0;
        }

        unreadNotifications.forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unreadNotifications);
        return unreadNotifications.size();
    }

    private void sendWebSocketEvent(Notification notification, UserDetail actor) {
        try {
            NotificationResponse response = mapToResponse(notification, actor);
            simpMessagingTemplate.convertAndSendToUser(notification.getRecipientId(), NOTIFICATION_DESTINATION, response);
        } catch (Exception ex) {
            log.warn("Unable to deliver notification {} via WebSocket: {}", notification.getId(), ex.getMessage());
        }
    }

    private NotificationResponse mapToResponse(Notification notification, UserDetail actor) {
        NotificationResponse response = notificationMapper.toResponse(notification);
        response.setActor(buildActorResponse(actor));
        return response;
    }

    private NotificationActorResponse buildActorResponse(UserDetail actor) {
        if (actor == null) {
            return null;
        }
        FileResponse avatar = actor.getAvatar() != null ? fileMapper.toFileResponse(actor.getAvatar()) : null;
        return NotificationActorResponse.builder()
                .id(actor.getId())
                .displayName(actor.getDisplayName())
                .shownName(actor.getShownName())
                .avatar(avatar)
                .build();
    }

    private Map<String, UserDetail> loadActors(List<Notification> notifications) {
        Set<String> actorIds = notifications.stream()
                .map(Notification::getActorId)
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());

        if (actorIds.isEmpty()) {
            return Map.of();
        }

        return userDetailRepository.findAllById(actorIds).stream()
                .collect(Collectors.toMap(UserDetail::getId, Function.identity()));
    }

    private String resolveDisplayName(UserDetail userDetail) {
        if (userDetail == null) {
            return "Someone";
        }
        if (StringUtils.hasText(userDetail.getDisplayName())) {
            return userDetail.getDisplayName();
        }
        if (userDetail.getUser() != null && StringUtils.hasText(userDetail.getUser().getUsername())) {
            return userDetail.getUser().getUsername();
        }
        if (StringUtils.hasText(userDetail.getShownName())) {
            return userDetail.getShownName();
        }
        return "Someone";
    }

    private String truncate(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        String normalized = value.trim();
        int maxLength = 140;
        if (normalized.length() <= maxLength) {
            return normalized;
        }
        return normalized.substring(0, maxLength) + "...";
    }

    private String resolveMessagePreview(ChatMessage message) {
        if (message == null) {
            return null;
        }
        if (StringUtils.hasText(message.getMessage())) {
            return truncate(message.getMessage());
        }
        if (message.getFileDocument() != null) {
            return "Sent an attachment";
        }
        if (message.getMessageType() != null) {
            return String.format("Sent a %s message", message.getMessageType().name().toLowerCase());
        }
        return null;
    }
}

