package com.hehe.thesocial.service.chatMessage;

import com.hehe.thesocial.dto.event.ChatMessageEventDTO;
import com.hehe.thesocial.dto.request.chat.ChatMessageUpdateRequest;
import com.hehe.thesocial.dto.request.chat.DirectChatMessageRequest;
import com.hehe.thesocial.dto.request.chat.GroupChatMessageRequest;
import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.entity.ChatMessage;
import com.hehe.thesocial.entity.Conversation;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.entity.enums.ConversationType;
import com.hehe.thesocial.entity.enums.EventType;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.mapper.chatMessage.ChatMessageMapper;
import com.hehe.thesocial.repository.ChatMessageRepository;
import com.hehe.thesocial.repository.ConversationRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.service.kafka.KafkaProducer;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ChatMessageServiceImpl {
    ChatMessageRepository chatMessageRepository;
    ChatMessageMapper chatMessageMapper;
    KafkaProducer producer;
    UserDetailRepository userDetailRepository;
    ConversationRepository conversationRepository;

    // ============ Public Methods ============

    public Page<ChatMessageResponse> getAllChatMessageByConversationId(String conversationId, Pageable pageable) {
        UserDetail currentUser = getCurrentUser();
        Conversation conversation = getConversation(conversationId);

        validateUserIsParticipant(conversation, currentUser.getId());

        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by("time").descending()
        );

        Page<ChatMessage> chatMessages = chatMessageRepository.findAllByConversationId(conversationId, sortedPageable);
        Page<ChatMessageResponse> responses = chatMessages.map(chatMessageMapper::toChatMessageResponse);

        responses.getContent().forEach(response ->
                response.setSender(response.getSender().equals(currentUser.getId()) ? "me" : "other")
        );

        return responses;
    }

    @Transactional
    public ChatMessageResponse createDirectChatMessage(DirectChatMessageRequest request) {
        UserDetail sender = getCurrentUser();
        UserDetail receiver = getUserDetailById(request.getReceiverId());

        Conversation conversation = findOrCreateDirectConversation(sender, receiver);
        Set<String> participantIds = getParticipantIds(conversation);

        ChatMessage chatMessage = buildChatMessage(
                request.getMessage(),
                conversation.getConversationId(),
                sender.getId()
        );

        return saveAndBroadcastMessage(chatMessage, participantIds);
    }

    @Transactional
    public ChatMessageResponse createGroupChatMessage(GroupChatMessageRequest request) {
        UserDetail sender = getCurrentUser();
        Conversation conversation = getConversation(request.getGroupId());

        validateGroupConversation(conversation);
        validateUserIsParticipant(conversation, sender.getId());

        ChatMessage chatMessage = buildChatMessage(
                request.getMessage(),
                conversation.getConversationId(),
                sender.getId()
        );

        Set<String> participantIds = getParticipantIds(conversation);
        return saveAndBroadcastMessage(chatMessage, participantIds);
    }

    @Transactional
    public ChatMessageResponse updateChatMessage(String chatMessageId, ChatMessageUpdateRequest request) {
        UserDetail currentUser = getCurrentUser();
        ChatMessage existingMessage = getChatMessage(chatMessageId);

        validateMessageOwnership(existingMessage, currentUser.getId());

        Conversation conversation = getConversation(existingMessage.getConversationId());
        validateUserIsParticipant(conversation, currentUser.getId());

        existingMessage.setMessage(request.getMessage());
        existingMessage.setEdited(true);
        existingMessage.setCreatedAt(LocalDateTime.now());

        ChatMessage updatedMessage = chatMessageRepository.save(existingMessage);
        return chatMessageMapper.toChatMessageResponse(updatedMessage);
    }

    @Transactional
    public void deleteChatMessage(String chatMessageId) {
        UserDetail currentUser = getCurrentUser();
        ChatMessage chatMessage = getChatMessage(chatMessageId);

        validateMessageOwnership(chatMessage, currentUser.getId());

        Conversation conversation = getConversation(chatMessage.getConversationId());
        validateUserIsParticipant(conversation, currentUser.getId());

        chatMessageRepository.deleteById(chatMessageId);
    }

    @Transactional
    public ChatMessageResponse sendMessageToCurrentUser(String senderId, String message) {
        UserDetail receiver = getCurrentUser();
        UserDetail sender = getUserDetailByUserId(senderId);

        Conversation conversation = findOrCreateDirectConversation(sender, receiver);
        Set<String> participantIds = getParticipantIds(conversation);

        ChatMessage chatMessage = buildChatMessage(
                message,
                conversation.getConversationId(),
                sender.getId()
        );

        return saveAndBroadcastMessage(chatMessage, participantIds);
    }

    // ============ Private Helper Methods ============

    private UserDetail getCurrentUser() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return userDetailRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
    }

    private UserDetail getUserDetailById(String userDetailId) {
        return userDetailRepository.findById(userDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private UserDetail getUserDetailByUserId(String userId) {
        return userDetailRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private Conversation getConversation(String conversationId) {
        return conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
    }

    private ChatMessage getChatMessage(String chatMessageId) {
        return chatMessageRepository.findById(chatMessageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));
    }

    private Set<String> getParticipantIds(Conversation conversation) {
        return conversation.getUserDetails().stream()
                .map(UserDetail::getId)
                .collect(Collectors.toSet());
    }

    private void validateUserIsParticipant(Conversation conversation, String userId) {
        Set<String> participantIds = getParticipantIds(conversation);
        if (!participantIds.contains(userId)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    private void validateGroupConversation(Conversation conversation) {
        if (conversation.getConversationType() != ConversationType.GROUP) {
            throw new AppException(ErrorCode.INVALID_CONVERSATION_TYPE);
        }
    }

    private void validateMessageOwnership(ChatMessage chatMessage, String userId) {
        if (!chatMessage.getSenderId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    private Conversation findOrCreateDirectConversation(UserDetail user1, UserDetail user2) {
        String hash = participantHash(user1.getId(), user2.getId());

        return conversationRepository.findByParticipantHash(hash)
                .orElseGet(() -> createDirectConversation(user1, user2, hash));
    }

    private Conversation createDirectConversation(UserDetail user1, UserDetail user2, String hash) {
        Conversation newConversation = Conversation.builder()
                .conversationType(ConversationType.DIRECT)
                .participantHash(hash)
                .userDetails(Set.of(user1, user2))
                .build();

        return conversationRepository.save(newConversation);
    }

    private ChatMessage buildChatMessage(String message, String conversationId, String senderId) {
        return ChatMessage.builder()
                .message(message)
                .conversationId(conversationId)
                .senderId(senderId)
                .edited(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private ChatMessageResponse saveAndBroadcastMessage(ChatMessage chatMessage, Set<String> participantIds) {
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        ChatMessageResponse response = chatMessageMapper.toChatMessageResponse(savedMessage);

        ChatMessageEventDTO event = ChatMessageEventDTO.builder()
                .response(response)
                .eventType(EventType.MESSAGE_CREATE)
                .participantsIds(participantIds)
                .build();

        producer.sendMessage(event);

        return response;
    }

    private String participantHash(String participant1, String participant2) {
        String[] participants = {participant1, participant2};
        java.util.Arrays.sort(participants);
        return participants[0] + "_" + participants[1];
    }
}
