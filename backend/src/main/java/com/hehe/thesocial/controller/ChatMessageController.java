package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.chat.ChatMessageUpdateRequest;
import com.hehe.thesocial.dto.request.chat.DirectChatMessageRequest;
import com.hehe.thesocial.dto.request.chat.GroupChatMessageRequest;
import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.service.chatMessage.ChatMessageService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/chat-messages")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessageController {
    ChatMessageService chatMessageService;

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<ApiResponse<Page<ChatMessageResponse>>> getAllChatMessagesByConversation(
            @PathVariable String conversationId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<ChatMessageResponse> messages = chatMessageService.getAllChatMessageByConversationId(conversationId, pageable);

        return ResponseEntity.ok(ApiResponse.<Page<ChatMessageResponse>>builder()
                .result(messages)
                .build());
    }



    @PostMapping()
    public ResponseEntity<ApiResponse<ChatMessageResponse>> createDirectMessage(
            @RequestBody @Valid DirectChatMessageRequest request) {

        ChatMessageResponse message = chatMessageService.createDirectChatMessage(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ChatMessageResponse>builder()
                        .result(message)
                        .build());
    }

    @PostMapping("/group")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> createGroupChatMessage(
            @RequestBody @Valid GroupChatMessageRequest request) {

        ChatMessageResponse message = chatMessageService.createGroupChatMessage(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ChatMessageResponse>builder()
                        .result(message)
                        .build());
    }

    @PutMapping("/{messageId}")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> updateMessage(
            @PathVariable String messageId,
            @RequestBody @Valid ChatMessageUpdateRequest request) {

        ChatMessageResponse updatedMessage = chatMessageService.updateChatMessage(messageId, request);

        return ResponseEntity.ok(ApiResponse.<ChatMessageResponse>builder()
                .result(updatedMessage)
                .build());
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable String messageId) {
        chatMessageService.deleteChatMessage(messageId);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Message deleted successfully")
                .build());
    }

    @PostMapping("/{messageId}/read")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> markMessageAsRead(@PathVariable String messageId) {
        ChatMessageResponse message = chatMessageService.markMessageAsRead(messageId);

        return ResponseEntity.ok(ApiResponse.<ChatMessageResponse>builder()
                .result(message)
                .message("Message marked as read")
                .build());
    }

    @PostMapping("/conversation/{conversationId}/read-all")
    public ResponseEntity<ApiResponse<Void>> markConversationAsRead(@PathVariable String conversationId) {
        chatMessageService.markConversationMessagesAsRead(conversationId);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("All messages marked as read")
                .build());
    }

    @PostMapping("/attachment")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendAttachment(
            @RequestParam String conversationId,
            @RequestParam("file") MultipartFile file) {

        ChatMessageResponse message = chatMessageService.sendAttachment(conversationId, file);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ChatMessageResponse>builder()
                        .result(message)
                        .build());
    }
}
