package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.aiChat.AiChatMessageRequest;
import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.dto.response.conversation.ConversationResponse;
import com.hehe.thesocial.service.aiChat.AiChatService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * RESTful controller for AI Chat functionality.
 * 
 * Endpoints:
 * - POST /ai-chat/messages - Send a message to AI and get response
 * - GET /ai-chat/conversation - Get or create AI conversation for current user
 */
@Slf4j
@RestController
@RequestMapping("/ai-chat")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AiChatController {
    AiChatService aiChatService;

    /**
     * Send a message to AI and receive a response.
     * 
     * POST /ai-chat/messages
     * 
     * @param request AI chat message request
     * @return ChatMessageResponse containing the AI's response
     */
    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @RequestBody @Valid AiChatMessageRequest request) {
        
        log.info("Received AI chat message request");
        ChatMessageResponse response = aiChatService.sendAiMessage(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ChatMessageResponse>builder()
                        .result(response)
                        .message("AI message sent successfully")
                        .build());
    }

    /**
     * Get or create the AI conversation for the current authenticated user.
     * 
     * GET /ai-chat/conversation
     * 
     * @return ConversationResponse for the AI conversation
     */
    @GetMapping("/conversation")
    public ResponseEntity<ApiResponse<ConversationResponse>> getConversation() {
        log.info("Getting AI conversation for current user");
        ConversationResponse conversation = aiChatService.getAiConversation();
        
        return ResponseEntity.ok(ApiResponse.<ConversationResponse>builder()
                .result(conversation)
                .message("AI conversation retrieved successfully")
                .build());
    }
}

