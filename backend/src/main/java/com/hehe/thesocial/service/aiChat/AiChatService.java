package com.hehe.thesocial.service.aiChat;

import com.hehe.thesocial.dto.request.chat.DirectChatMessageRequest;
import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.dto.response.conversation.ConversationResponse;
import com.hehe.thesocial.entity.User;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.repository.UserRepository;
import com.hehe.thesocial.service.chatMessage.ChatMessageServiceImpl;
import com.hehe.thesocial.service.conversation.ConversationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AiChatService {
    ChatClient chatClient;
    ChatMessageServiceImpl chatMessageServiceImpl;
    UserDetailRepository userDetailRepository;
    UserRepository userRepository;
    MongoChatMemory mongoChatMemory;
    ConversationService conversationService;


    @Transactional
    public ChatMessageResponse aiChatRequest(DirectChatMessageRequest request) {
        UserDetail aiUserDetail = getOrCreateAiUser();
        UserDetail currentUser = getCurrentUser();

        // Find or create conversation
        String conversationId = chatMessageServiceImpl.findOrCreateConversation(currentUser, aiUserDetail);

        // Set up chat memory advisor for AI response
        MessageChatMemoryAdvisor chatMemoryAdvisor = MessageChatMemoryAdvisor.builder(mongoChatMemory)
                .conversationId(conversationId)
                .build();

        // Get AI response and save it via MessageChatMemoryAdvisor
        // The MessageChatMemoryAdvisor will automatically save both user message and AI response
        String aiResponse = chatClient
                .prompt()
                .user(request.getMessage())
                .advisors(List.of(chatMemoryAdvisor))
                .call()
                .content();

        // Get the last saved AI message (already saved by MessageChatMemoryAdvisor) and broadcast it
        return chatMessageServiceImpl.getAndBroadcastLastMessage(conversationId, aiUserDetail.getId());
    }

    public ConversationResponse getAiConversation() {
        UserDetail aiUserDetail = getOrCreateAiUser();
        UserDetail currentUser = getCurrentUser();

        // Find or create conversation with AI
        String conversationId = chatMessageServiceImpl.findOrCreateConversation(currentUser, aiUserDetail);

        // Get the conversation details using ConversationService
        return conversationService.getConversationById(conversationId);
    }

    private UserDetail getCurrentUser() {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        return userDetailRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private UserDetail getOrCreateAiUser() {
        // Try to find existing AI user
        return userDetailRepository.findByUserId("ai-system")
                .orElseGet(() -> {
                    // Create AI system user if not exists
                    User aiUser = User.builder()
                            .id("ai-system")
                            .username("AI Assistant")
                            .mail("ai@system.local")
                            .enable(true)
                            .build();

                    User savedAiUser = userRepository.save(aiUser);

                    UserDetail aiUserDetail = UserDetail.builder()
                            .user(savedAiUser)
                            .displayName("AI Assistant")
                            .bio("Your AI Chat Assistant")
                            .shownName("AI Assistant")
                            .build();

                    return userDetailRepository.save(aiUserDetail);
                });
    }
}