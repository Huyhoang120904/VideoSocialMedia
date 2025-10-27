package com.hehe.thesocial.service.aiChat;

import com.hehe.thesocial.dto.event.ChatMessageEventDTO;
import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.entity.ChatMessage;
import com.hehe.thesocial.entity.Conversation;
import com.hehe.thesocial.entity.User;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.entity.enums.EventType;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.mapper.chatMessage.ChatMessageMapper;
import com.hehe.thesocial.repository.ChatMessageRepository;
import com.hehe.thesocial.repository.ConversationRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.repository.UserRepository;
import com.hehe.thesocial.service.kafka.KafkaProducer;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

import java.util.ArrayList;
import java.util.List;

@Component
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class MongoChatMemory implements ChatMemory {
    ChatMessageRepository chatMessageRepository;
    ConversationRepository conversationRepository;
    int maxMessages;
    UserDetailRepository userDetailRepository;
    UserRepository userRepository;
    ChatMessageMapper chatMessageMapper;
    KafkaProducer producer;

    public MongoChatMemory(ChatMessageRepository chatMessageRepository,
                           ConversationRepository conversationRepository,
                           UserDetailRepository userDetailRepository,
                           UserRepository userRepository,
                           ChatMessageMapper chatMessageMapper,
                           KafkaProducer producer) {
        this.chatMessageRepository = chatMessageRepository;
        this.conversationRepository = conversationRepository;
        this.maxMessages = 10;
        this.userDetailRepository = userDetailRepository;
        this.userRepository = userRepository;
        this.chatMessageMapper = chatMessageMapper;
        this.producer = producer;
    }

    @Override
    public void add(String conversationId, List<Message> messages) {
        // Validate conversation exists
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        UserDetail aiUserDetail = getOrCreateAiUser();
        UserDetail currentUser = getCurrentUser();

        // Get participant IDs for broadcasting
        Set<String> participantIds = conversation.getUserDetails().stream()
                .map(UserDetail::getId)
                .collect(Collectors.toSet());

        // Save each message to the database and broadcast
        for (Message message : messages) {
            ChatMessage chatMessage = ChatMessage.builder()
                    .conversationId(conversationId)
                    .message(message.getText())
                    .createdAt(java.time.LocalDateTime.now())
                    .edited(false)
                    .build();

            // Determine sender based on message type
            if (message instanceof AssistantMessage) {
                chatMessage.setSenderId(aiUserDetail.getId());
            } else if (message instanceof UserMessage) {
                chatMessage.setSenderId(currentUser.getId());
            }

            ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
            
            // Create response and broadcast
            ChatMessageResponse response = chatMessageMapper.toChatMessageResponse(savedMessage);
            
            // Add sender's avatar to the response
            UserDetail sender = getUserDetailById(savedMessage.getSenderId());
            response.setAvatar(sender.getAvatar());

            ChatMessageEventDTO event = ChatMessageEventDTO.builder()
                    .response(response)
                    .eventType(EventType.MESSAGE_CREATE)
                    .participantsIds(participantIds)
                    .build();

            producer.sendMessage(event);
        }
    }

    @Override
    public List<Message> get(String conversationId) {
        // Validate conversation exists
        conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Retrieve messages from the conversation (limited by maxMessages)
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
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        return userDetailRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    /**
     * Get user detail by ID
     */
    private UserDetail getUserDetailById(String userDetailId) {
        return userDetailRepository.findById(userDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}

