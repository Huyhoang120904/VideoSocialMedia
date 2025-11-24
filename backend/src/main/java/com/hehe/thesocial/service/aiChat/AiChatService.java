package com.hehe.thesocial.service.aiChat;

import com.hehe.thesocial.dto.request.aiChat.AiChatMessageRequest;
import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.dto.response.conversation.ConversationResponse;
import com.hehe.thesocial.entity.ChatMessage;
import com.hehe.thesocial.entity.User;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.mapper.chatMessage.ChatMessageMapper;
import com.hehe.thesocial.repository.ChatMessageRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.repository.UserRepository;
import com.hehe.thesocial.service.chatMessage.ChatMessageService;
import com.hehe.thesocial.service.conversation.ConversationService;
import com.hehe.thesocial.service.messageDelivery.MessageDeliveryService;
import com.hehe.thesocial.service.messageDelivery.NewestMessageBroadcastService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.api.Advisor;
import org.springframework.ai.document.Document;
import org.springframework.ai.rag.advisor.RetrievalAugmentationAdvisor;
import org.springframework.ai.rag.generation.augmentation.ContextualQueryAugmenter;
import org.springframework.ai.rag.retrieval.search.DocumentRetriever;
import org.springframework.ai.rag.retrieval.search.VectorStoreDocumentRetriever;
import org.springframework.ai.vectorstore.qdrant.QdrantVectorStore;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AiChatService {
    ChatClient chatClient;
    ChatMessageService chatMessageService;
    UserDetailRepository userDetailRepository;
    UserRepository userRepository;
    MongoChatMemory mongoChatMemory;
    ConversationService conversationService;
    ChatMessageRepository chatMessageRepository;
    ChatMessageMapper chatMessageMapper;
    MessageDeliveryService messageDeliveryService;
    NewestMessageBroadcastService newestMessageBroadcastService;
    QdrantVectorStore vectorStore;

    /**
     * Process AI chat request and return AI response.
     * This method explicitly saves both user message and AI response.
     *
     * @param request AI chat message request
     * @return ChatMessageResponse containing the AI's response
     */
    @Transactional
    public ChatMessageResponse sendAiMessage(AiChatMessageRequest request) {
        log.info("Processing AI chat request: {}", request.getMessage());
        
        UserDetail aiUserDetail = getOrCreateAiUser();
        UserDetail currentUser = getCurrentUser();

        // Find or create conversation
        String conversationId = chatMessageService.findOrCreateConversation(currentUser, aiUserDetail);

        // Save user message explicitly
        ChatMessage userMessage = ChatMessage.builder()
                .conversationId(conversationId)
                .senderId(currentUser.getId())
                .message(request.getMessage())
                .edited(false)
                .build();
        userMessage = chatMessageRepository.save(userMessage);
        
        // Broadcast user message
        ChatMessageResponse userMessageResponse = chatMessageMapper.toChatMessageResponse(userMessage);
        UserDetail sender = getUserDetailById(userMessage.getSenderId());
        userMessageResponse.setAvatar(sender.getAvatar());
        messageDeliveryService.deliverMessageToConversation(conversationId, userMessageResponse);
        newestMessageBroadcastService.broadcastNewestMessage(conversationId, userMessageResponse);

        //Chat memory
        MessageChatMemoryAdvisor chatMemoryAdvisor = MessageChatMemoryAdvisor.builder(mongoChatMemory)
                .conversationId(conversationId)
                .build();


        Advisor retrievalAugmentationAdvisor = RetrievalAugmentationAdvisor.builder()
                .documentRetriever(VectorStoreDocumentRetriever.builder()
                        .similarityThreshold(0.50)
                        .vectorStore(vectorStore)
                        .build())
                .queryAugmenter(ContextualQueryAugmenter.builder()
                        .allowEmptyContext(true)
                        .build())
                .build();

        String aiResponse = chatClient
                .prompt()
                .user(request.getMessage())
                .advisors(List.of(chatMemoryAdvisor, retrievalAugmentationAdvisor))
                .call()
                .content();

        // Save AI response explicitly
        ChatMessage aiMessage = ChatMessage.builder()
                .conversationId(conversationId)
                .senderId(aiUserDetail.getId())
                .message(aiResponse)
                .edited(false)
                .build();
        aiMessage = chatMessageRepository.save(aiMessage);

        // Create response and broadcast
        ChatMessageResponse aiMessageResponse = chatMessageMapper.toChatMessageResponse(aiMessage);
        aiMessageResponse.setAvatar(aiUserDetail.getAvatar());
        messageDeliveryService.deliverMessageToConversation(conversationId, aiMessageResponse);
        newestMessageBroadcastService.broadcastNewestMessage(conversationId, aiMessageResponse);

        log.info("AI response saved and broadcasted for conversation: {}", conversationId);
        return aiMessageResponse;
    }

    /**
     * Get or create the AI conversation for the current user.
     *
     * @return ConversationResponse for the AI conversation
     */
    public ConversationResponse getAiConversation() {
        UserDetail aiUserDetail = getOrCreateAiUser();
        UserDetail currentUser = getCurrentUser();

        // Find or create conversation with AI
        String conversationId = chatMessageService.findOrCreateConversation(currentUser, aiUserDetail);

        // Get the conversation details using ConversationService
        return conversationService.getConversationById(conversationId);
    }

    /**
     * Get user detail by ID.
     */
    private UserDetail getUserDetailById(String userDetailId) {
        return userDetailRepository.findById(userDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

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

    public UserDetail getOrCreateAiUser() {
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