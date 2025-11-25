package com.hehe.thesocial.service.aiChat;


import com.hehe.thesocial.entity.ChatMessage;
import com.hehe.thesocial.entity.Conversation;
import com.hehe.thesocial.entity.User;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.repository.ChatMessageRepository;
import com.hehe.thesocial.repository.ConversationRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.repository.UserRepository;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class MongoChatMemory implements ChatMemory {
    ChatMessageRepository chatMessageRepository;
    ConversationRepository conversationRepository;
    int maxMessages;
    UserDetailRepository userDetailRepository;
    UserRepository userRepository;

    public MongoChatMemory(ChatMessageRepository chatMessageRepository,
                           ConversationRepository conversationRepository,
                           UserDetailRepository userDetailRepository,
                           UserRepository userRepository
    ) {
        this.chatMessageRepository = chatMessageRepository;
        this.conversationRepository = conversationRepository;
        this.maxMessages = 10;
        this.userDetailRepository = userDetailRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void add(String conversationId, List<Message> messages) {
        // Note: This method is called by MessageChatMemoryAdvisor for automatic message persistence.
        // However, since we now explicitly save messages in AiChatService.sendAiMessage(),
        // this method should check for duplicates to avoid saving the same message twice.
        //
        // For now, we'll skip saving here since messages are explicitly saved in the service layer.
        // The advisor is primarily used for retrieving conversation history via the get() method.

        // Validate conversation exists
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Skip automatic saving - messages are explicitly saved in AiChatService
        // This prevents duplicate message saves while still allowing the advisor
        // to retrieve conversation history via the get() method
        log.debug("MongoChatMemory.add() called for conversation {}, but skipping save as messages are explicitly saved in service layer", conversationId);
    }

    @Override
    public List<Message> get(String conversationId) {
        // Validate conversation exists
        conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Retrieve messages from the conversation (limited by lastN or maxMessages)
        List<ChatMessage> chatMessages = chatMessageRepository
                .findByConversationIdOrderByCreatedAtDesc(conversationId);

        // Limit to maxMessages
        int limit = Math.min(maxMessages, chatMessages.size());
        List<ChatMessage> limitedMessages = chatMessages.subList(0, limit);

        // Convert to Spring AI Message format (reverse to maintain chronological order)
        List<Message> messages = new ArrayList<>();
        for (int i = limitedMessages.size() - 1; i >= 0; i--) {
            ChatMessage chatMessage = limitedMessages.get(i);
            messages.add(toSpringAiMessage(chatMessage));
        }

        return messages;
    }

    @Override
    public void clear(String conversationId) {
        // Validate conversation exists
        conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Delete all messages in the conversation
        chatMessageRepository.deleteByConversationId(conversationId);
    }

    /**
     * Convert ChatMessage entity to Spring AI Message
     */
    private Message toSpringAiMessage(ChatMessage chatMessage) {
        UserDetail aiUserDetail = getOrCreateAiUser();

        // Determine if message is from AI or user
        boolean isFromAi = chatMessage.getSenderId() != null &&
                chatMessage.getSenderId().equals(aiUserDetail.getId());

        if (isFromAi) {
            return new AssistantMessage(chatMessage.getMessage());
        } else {
            return new UserMessage(chatMessage.getMessage());
        }
    }

    /**
     * Get or create the AI system user
     */
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

    /**
     * Get the current authenticated user
     */
    private UserDetail getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            String userDetailId = jwt.getClaim("userDetailId");

            if (userDetailId == null) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }

            return userDetailRepository.findById(userDetailId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }

        throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    /**
     * Get user detail by ID
     */
    private UserDetail getUserDetailById(String userDetailId) {
        return userDetailRepository.findById(userDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}

