package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.conversation.ConversationRequest;
import com.hehe.thesocial.dto.response.conversation.ConversationResponse;
import com.hehe.thesocial.service.conversation.ConversationService;
import io.swagger.v3.oas.annotations.tags.Tag;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Conversations", description = "Conversation management endpoints - requires authentication")
public class ConversationController extends BaseController {
    ConversationService conversationService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedModel<EntityModel<ConversationResponse>>>> getMyConversations(
            @PageableDefault(size = 20) Pageable pageable, PagedResourcesAssembler<ConversationResponse> assembler){
        return ok(assembler.toModel(conversationService.getMyConversations(pageable)));
    }

    @GetMapping("/{conversationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ConversationResponse>> getConversationById(@PathVariable String conversationId) {
        return ok(conversationService.getConversationById(conversationId));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ConversationResponse>> createConversation(@RequestBody ConversationRequest request) {
        return created(conversationService.createConversation(request));
    }

    @PutMapping("/{conversationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ConversationResponse>> updateConversation(
            @PathVariable String conversationId,
            @RequestBody ConversationRequest request) {
        return ok(conversationService.updateConversation(conversationId, request));
    }

    @PostMapping("/{conversationId}/members/{participantId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ConversationResponse>> addMemberToConversation(
            @PathVariable String conversationId,
            @PathVariable String participantId) {
        return ok(conversationService.addMember(conversationId, participantId));
    }

    @DeleteMapping("/{conversationId}/members/{participantId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ConversationResponse>> removeMemberFromConversation(
            @PathVariable String conversationId,
            @PathVariable String participantId) {
        return ok(conversationService.removeMember(conversationId, participantId));
    }

    @DeleteMapping("/{conversationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteConversation(@PathVariable String conversationId) {
        conversationService.deleteConversation(conversationId);
        return respond(HttpStatus.NO_CONTENT, "Conversation deleted successfully");
    }
}
