package com.hehe.thesocial.service.aiChat;

import com.hehe.thesocial.dto.request.chat.DirectChatMessageRequest;
import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.entity.User;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.repository.UserRepository;
import com.hehe.thesocial.service.chatMessage.ChatMessageServiceImpl;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
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


    @Transactional
    public ChatMessageResponse aiChatRequest(DirectChatMessageRequest request) {
        UserDetail aiUserDetail = getOrCreateAiUser();
        request.setReceiverId(aiUserDetail.getId());

        // Save user's message and get conversation ID
        ChatMessageResponse userMessage = chatMessageServiceImpl.createDirectChatMessage(request);
        String conversationId = userMessage.getConversationId();

        MessageChatMemoryAdvisor chatMemoryAdvisor = MessageChatMemoryAdvisor.builder(mongoChatMemory)
                .conversationId(conversationId)
                .build();

        // Get AI response with conversation context
        // IMPORTANT: Use CHAT_MEMORY_CONVERSATION_ID_KEY constant
        String aiResponse = chatClient
                .prompt()
                .user(request.getMessage())
                .advisors(List.of(chatMemoryAdvisor))
                .call()
                .content();

        // Send AI response back
        return chatMessageServiceImpl.sendMessageToCurrentUser(
                aiUserDetail.getUser().getId(),
                aiResponse);
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