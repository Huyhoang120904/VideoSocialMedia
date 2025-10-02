package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.conversation.ConversationRequest;
import com.hehe.thesocial.dto.response.conversation.ConversationListResponse;
import com.hehe.thesocial.dto.response.conversation.ConversationResponse;
import com.hehe.thesocial.dto.response.role.RoleResponse;
import com.hehe.thesocial.service.conversation.ConversationService;
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
@RequestMapping("/conversations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationController {
    ConversationService conversationService;

    @GetMapping("/me")
    public ApiResponse<PagedModel<EntityModel<ConversationListResponse>>> getMyConversations(
            @PageableDefault(size = 20) Pageable pageable, PagedResourcesAssembler<ConversationListResponse> assembler){
        return ApiResponse.<PagedModel<EntityModel<ConversationListResponse>>>builder()
                .result(assembler.toModel(conversationService.getMyConversations(pageable)))
                .build();
    }

    @PostMapping
    public ApiResponse<ConversationResponse> createConversation(@RequestBody ConversationRequest request) {
        return ApiResponse.<ConversationResponse>builder()
                .result(conversationService.createConversation(request))
                .build();
    }

    @PutMapping("/{conversationId}")
    public ApiResponse<ConversationResponse> updateConversation(
            @PathVariable String conversationId,
            @RequestBody ConversationRequest request) {
        return ApiResponse.<ConversationResponse>builder()
                .result(conversationService.updateConversation(conversationId, request))
                .build();
    }

    @PostMapping("/{conversationId}/members/{participantId}")
    public ApiResponse<ConversationResponse> addMemberToConversation(
            @PathVariable String conversationId,
            @PathVariable String participantId) {
        return ApiResponse.<ConversationResponse>builder()
                .result(conversationService.addMember(conversationId, participantId))
                .build();
    }

    @DeleteMapping("/{conversationId}/members/{participantId}")
    public ApiResponse<ConversationResponse> removeMemberFromConversation(
            @PathVariable String conversationId,
            @PathVariable String participantId) {
        return ApiResponse.<ConversationResponse>builder()
                .result(conversationService.removeMember(conversationId, participantId))
                .build();
    }

    @DeleteMapping("/{conversationId}")
    public ApiResponse<Void> deleteConversation(@PathVariable String conversationId) {
        conversationService.deleteConversation(conversationId);
        return ApiResponse.<Void>builder()
                .message("Conversation deleted successfully")
                .build();
    }
}
