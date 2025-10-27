package com.hehe.thesocial.service.conversation;

import com.hehe.thesocial.dto.request.conversation.ConversationRequest;
import com.hehe.thesocial.dto.response.conversation.ConversationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public interface ConversationService {
    @Transactional
    ConversationResponse createConversation(ConversationRequest request);

    ConversationResponse getConversationById(String conversationId);

    @Transactional
    ConversationResponse updateConversation(String conversationId, ConversationRequest request);

    @Transactional
    ConversationResponse addMember(String conversationId, String newParticipantId);

    @Transactional
    ConversationResponse removeMember(String conversationId, String participantId);

    Page<ConversationResponse> getMyConversations(Pageable pageable);

    void deleteConversation(String conversationId);
}
