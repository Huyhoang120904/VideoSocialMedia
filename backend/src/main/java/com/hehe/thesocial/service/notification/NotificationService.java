package com.hehe.thesocial.service.notification;

import com.hehe.thesocial.dto.response.notification.NotificationResponse;
import com.hehe.thesocial.entity.ChatMessage;
import com.hehe.thesocial.entity.Comment;
import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.UserDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Set;

public interface NotificationService {
    void notifyCommentOnFeedItem(FeedItem feedItem, Comment comment, UserDetail commenter);

    void notifyLikeOnFeedItem(FeedItem feedItem, UserDetail liker);

    void notifyConversationMessage(Set<String> participantIds, ChatMessage message, UserDetail sender);

    Page<NotificationResponse> getNotifications(Pageable pageable, boolean unreadOnly);

    void markNotificationAsRead(String notificationId);

    int markAllNotificationsAsRead();
}





