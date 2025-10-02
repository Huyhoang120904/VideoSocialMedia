package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.chat.ChatMessageCreationRequest;
import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.service.chatMessage.ChatMessageServiceImpl;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat-messages")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class ChatMessageController {
    ChatMessageServiceImpl chatMessageService;

    @GetMapping("/conversation/{conversationId}")
    public ApiResponse<PagedModel<EntityModel<ChatMessageResponse>>> getAllChatMessagesByConversationId(
            @PathVariable String conversationId,
            @PageableDefault(size = 20, page = 0) Pageable pageable,
            PagedResourcesAssembler<ChatMessageResponse> assembler) {
        return ApiResponse.<PagedModel<EntityModel<ChatMessageResponse>>>builder()
                .result(assembler.toModel(chatMessageService.getAllChatMessageByConversationId(conversationId, pageable)))
                .build();
    }

    @PostMapping
    public ApiResponse<ChatMessageResponse> createChatMessage(@RequestBody ChatMessageCreationRequest request) {
        return ApiResponse.<ChatMessageResponse>builder()
                .result(chatMessageService.createChatMessage(request))
                .build();
    }

    @PutMapping
    public ApiResponse<ChatMessageResponse> updateChatMessage(@RequestBody ChatMessageCreationRequest request) {
        return ApiResponse.<ChatMessageResponse>builder()
                .result(chatMessageService.updateChatMessage(request))
                .build();
    }

    @DeleteMapping("/{chatMessageId}")
    public ApiResponse<Void> deleteChatMessage(@PathVariable String chatMessageId) {
        chatMessageService.deleteChatMessage(chatMessageId);
        return ApiResponse.<Void>builder()
                .build();
    }
}
