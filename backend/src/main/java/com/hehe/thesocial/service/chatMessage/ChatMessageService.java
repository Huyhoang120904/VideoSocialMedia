package com.hehe.thesocial.service.chatMessage;

import com.hehe.thesocial.dto.request.chat.ChatMessageUpdateRequest;
import com.hehe.thesocial.dto.request.chat.DirectChatMessageRequest;
import com.hehe.thesocial.dto.request.chat.GroupChatMessageRequest;
import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.entity.UserDetail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

public interface ChatMessageService {
    Page<ChatMessageResponse> getAllChatMessageByConversationId(String conversationId, Pageable pageable);

    @Transactional
    ChatMessageResponse createDirectChatMessage(DirectChatMessageRequest request);

    @Transactional
    ChatMessageResponse createGroupChatMessage(GroupChatMessageRequest request);

    @Transactional
    ChatMessageResponse updateChatMessage(String chatMessageId, ChatMessageUpdateRequest request);

    @Transactional
    void deleteChatMessage(String chatMessageId);

    @Transactional
    ChatMessageResponse markMessageAsRead(String messageId);

    @Transactional
    void markConversationMessagesAsRead(String conversationId);

    @Transactional
    String findOrCreateConversation(UserDetail user1, UserDetail user2);

    @Transactional
    ChatMessageResponse getAndBroadcastLastMessage(String conversationId, String senderId);

    @Transactional
    ChatMessageResponse sendMessageToCurrentUser(String senderId, String message);
}
