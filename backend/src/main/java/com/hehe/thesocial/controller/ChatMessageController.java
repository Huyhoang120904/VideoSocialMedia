package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.chat.ChatMessageUpdateRequest;
import com.hehe.thesocial.dto.request.chat.DirectChatMessageRequest;
import com.hehe.thesocial.dto.request.chat.GroupChatMessageRequest;
import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.service.chatMessage.ChatMessageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/chat-messages")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Chat Messages", description = "Chat message management endpoints - requires authentication")
public class ChatMessageController extends BaseController {
    ChatMessageService chatMessageService;

    @GetMapping("/conversation/{conversationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<ChatMessageResponse>>> getAllChatMessagesByConversation(
            @PathVariable String conversationId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<ChatMessageResponse> messages = chatMessageService.getAllChatMessageByConversationId(conversationId, pageable);

        return ok(messages);
    }



    @PostMapping()
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> createDirectMessage(
            @RequestBody @Valid DirectChatMessageRequest request) {

        ChatMessageResponse message = chatMessageService.createDirectChatMessage(request);

        return created(message);
    }

    @PostMapping("/group")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> createGroupChatMessage(
            @RequestBody @Valid GroupChatMessageRequest request) {

        ChatMessageResponse message = chatMessageService.createGroupChatMessage(request);

        return created(message);
    }

    @PutMapping("/{messageId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> updateMessage(
            @PathVariable String messageId,
            @RequestBody @Valid ChatMessageUpdateRequest request) {

        ChatMessageResponse updatedMessage = chatMessageService.updateChatMessage(messageId, request);

        return ok(updatedMessage);
    }

    @DeleteMapping("/{messageId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable String messageId) {
        chatMessageService.deleteChatMessage(messageId);

        return okMessage("Message deleted successfully");
    }

    @PostMapping("/{messageId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> markMessageAsRead(@PathVariable String messageId) {
        ChatMessageResponse message = chatMessageService.markMessageAsRead(messageId);

        return ok(message, "Message marked as read");
    }

    @PostMapping("/conversation/{conversationId}/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markConversationAsRead(@PathVariable String conversationId) {
        chatMessageService.markConversationMessagesAsRead(conversationId);

        return okMessage("All messages marked as read");
    }

    @PostMapping("/attachment")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendAttachment(
            @RequestParam String conversationId,
            @RequestParam("file") MultipartFile file) {

        ChatMessageResponse message = chatMessageService.sendAttachment(conversationId, file);

        return created(message);
    }
}
