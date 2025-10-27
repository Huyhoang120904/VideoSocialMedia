package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.conversation.ConversationRequest;
import com.hehe.thesocial.dto.response.conversation.ConversationResponse;
import com.hehe.thesocial.service.conversation.ConversationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationController {
    ConversationService conversationService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<PagedModel<EntityModel<ConversationResponse>>>> getMyConversations(
            @PageableDefault(size = 20) Pageable pageable, PagedResourcesAssembler<ConversationResponse> assembler){
        return ResponseEntity.ok(ApiResponse.<PagedModel<EntityModel<ConversationResponse>>>builder()
                .result(assembler.toModel(conversationService.getMyConversations(pageable)))
                .build());
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<ApiResponse<ConversationResponse>> getConversationById(@PathVariable String conversationId) {
        return ResponseEntity.ok(ApiResponse.<ConversationResponse>builder()
                .result(conversationService.getConversationById(conversationId))
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ConversationResponse>> createConversation(@RequestBody ConversationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<ConversationResponse>builder()
                .result(conversationService.createConversation(request))
                .build());
    }

    @PutMapping("/{conversationId}")
    public ResponseEntity<ApiResponse<ConversationResponse>> updateConversation(
            @PathVariable String conversationId,
            @RequestBody ConversationRequest request) {
        return ResponseEntity.ok(ApiResponse.<ConversationResponse>builder()
                .result(conversationService.updateConversation(conversationId, request))
                .build());
    }

    @PostMapping("/{conversationId}/members/{participantId}")
    public ResponseEntity<ApiResponse<ConversationResponse>> addMemberToConversation(
            @PathVariable String conversationId,
            @PathVariable String participantId) {
        return ResponseEntity.ok(ApiResponse.<ConversationResponse>builder()
                .result(conversationService.addMember(conversationId, participantId))
                .build());
    }

    @DeleteMapping("/{conversationId}/members/{participantId}")
    public ResponseEntity<ApiResponse<ConversationResponse>> removeMemberFromConversation(
            @PathVariable String conversationId,
            @PathVariable String participantId) {
        return ResponseEntity.ok(ApiResponse.<ConversationResponse>builder()
                .result(conversationService.removeMember(conversationId, participantId))
                .build());
    }

    @DeleteMapping("/{conversationId}")
    public ResponseEntity<ApiResponse<Void>> deleteConversation(@PathVariable String conversationId) {
        conversationService.deleteConversation(conversationId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.<Void>builder()
                .message("Conversation deleted successfully")
                .build());
    }
}
