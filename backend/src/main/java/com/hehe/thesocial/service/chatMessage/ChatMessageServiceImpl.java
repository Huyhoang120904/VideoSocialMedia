package com.hehe.thesocial.service.chatMessage;

import com.hehe.thesocial.dto.event.ChatMessageEventDTO;
import com.hehe.thesocial.dto.event.ReadStatusEventDTO;
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
import com.hehe.thesocial.service.messageDelivery.MessageDeliveryService;
import com.hehe.thesocial.service.messageDelivery.NewestMessageBroadcastService;
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
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ChatMessageServiceImpl implements ChatMessageService {
    ChatMessageRepository chatMessageRepository;
    ChatMessageMapper chatMessageMapper;
    KafkaProducer producer;
    UserDetailRepository userDetailRepository;
    ConversationRepository conversationRepository;
    MessageDeliveryService messageDeliveryService;
    NewestMessageBroadcastService newestMessageBroadcastService;

    // ============ Public Methods ============

    @Override
    public Page<ChatMessageResponse> getAllChatMessageByConversationId(String conversationId, Pageable pageable) {
        UserDetail currentUser = getCurrentUser();
        Conversation conversation = getConversation(conversationId);

        validateUserIsParticipant(conversation, currentUser.getId());

        Page<ChatMessage> chatMessages = chatMessageRepository.findAllByConversationId(conversationId, pageable);
        Page<ChatMessageResponse> responses = chatMessages.map(chatMessageMapper::toChatMessageResponse);

        // Create a map of message IDs to ChatMessage objects for efficient lookup
        Map<String, ChatMessage> messageMap = chatMessages.getContent().stream()
                .collect(Collectors.toMap(ChatMessage::getId, message -> message));

        responses.getContent().forEach(response -> {
                String senderId = response.getSender();
                UserDetail sender = getUserDetailById(senderId);
                response.setAvatar(sender.getAvatar());
                response.setSender(senderId.equals(currentUser.getId()) ? "me" : "other");
                
                // Set read status information using the message map
                ChatMessage message = messageMap.get(response.getId());
                if (message != null) {
                    response.setReadParticipantsId(message.getReadParticipantsId());
                    response.setIsReadByCurrentUser(message.getReadParticipantsId() != null && 
                        message.getReadParticipantsId().contains(currentUser.getId()));
                    response.setReadCount(message.getReadParticipantsId() != null ? 
                        message.getReadParticipantsId().size() : 0);
                }
        });

        return responses;
    }

    @Transactional
    @Override
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
    @Override
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
    @Override
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
    @Override
    public void deleteChatMessage(String chatMessageId) {
        UserDetail currentUser = getCurrentUser();
        ChatMessage chatMessage = getChatMessage(chatMessageId);

        validateMessageOwnership(chatMessage, currentUser.getId());

        Conversation conversation = getConversation(chatMessage.getConversationId());
        validateUserIsParticipant(conversation, currentUser.getId());

        chatMessageRepository.deleteById(chatMessageId);
    }

    @Transactional
    @Override
    public ChatMessageResponse markMessageAsRead(String messageId) {
        UserDetail currentUser = getCurrentUser();
        ChatMessage message = getChatMessage(messageId);
        
        Conversation conversation = getConversation(message.getConversationId());
        validateUserIsParticipant(conversation, currentUser.getId());
        
        // Don't mark own messages as read
        if (message.getSenderId().equals(currentUser.getId())) {
            return chatMessageMapper.toChatMessageResponse(message);
        }
        
        // Add current user to read participants if not already there
        if (message.getReadParticipantsId() == null) {
            message.setReadParticipantsId(new java.util.ArrayList<>());
        }
        
        // Check if already read to avoid duplicate events
        boolean wasAlreadyRead = message.getReadParticipantsId().contains(currentUser.getId());
        
        if (wasAlreadyRead) {
            // Return existing message without sending event
            return chatMessageMapper.toChatMessageResponse(message);
        }
        
        // Mark as read and save to database first
        message.getReadParticipantsId().add(currentUser.getId());
        message = chatMessageRepository.save(message);
        
        // Send read status update via Kafka
        ReadStatusEventDTO readStatusEvent = ReadStatusEventDTO.builder()
                .messageId(messageId)
                .conversationId(message.getConversationId())
                .readParticipantsId(message.getReadParticipantsId())
                .readCount(message.getReadParticipantsId().size())
                .readerId(currentUser.getId())
                .build();
        
        producer.sendReadStatusUpdate(readStatusEvent);
        
        return chatMessageMapper.toChatMessageResponse(message);
    }

    @Transactional
    @Override
    public void markConversationMessagesAsRead(String conversationId) {
        UserDetail currentUser = getCurrentUser();
        Conversation conversation = getConversation(conversationId);
        validateUserIsParticipant(conversation, currentUser.getId());
        
        // Get all unread messages in this conversation for the current user
        java.util.List<ChatMessage> unreadMessages = chatMessageRepository
            .findByConversationIdAndSenderIdNotAndReadParticipantsIdNotContaining(
                conversationId, currentUser.getId(), currentUser.getId());
        
        // Mark all as read first
        for (ChatMessage message : unreadMessages) {
            if (message.getReadParticipantsId() == null) {
                message.setReadParticipantsId(new java.util.ArrayList<>());
            }
            if (!message.getReadParticipantsId().contains(currentUser.getId())) {
                message.getReadParticipantsId().add(currentUser.getId());
            }
        }
        
        // Save all messages to database first
        if (!unreadMessages.isEmpty()) {
            chatMessageRepository.saveAll(unreadMessages);
            
            // Then send read status updates for each message
            for (ChatMessage message : unreadMessages) {
                ReadStatusEventDTO readStatusEvent = ReadStatusEventDTO.builder()
                        .messageId(message.getId())
                        .conversationId(conversationId)
                        .readParticipantsId(message.getReadParticipantsId())
                        .readCount(message.getReadParticipantsId().size())
                        .readerId(currentUser.getId())
                        .build();
                
                producer.sendReadStatusUpdate(readStatusEvent);
            }
        }
    }

    @Transactional
    @Override
    public String findOrCreateConversation(UserDetail user1, UserDetail user2) {
        Conversation conversation = findOrCreateDirectConversation(user1, user2);
        return conversation.getConversationId();
    }

    @Transactional
    @Override
    public ChatMessageResponse getAndBroadcastLastMessage(String conversationId, String senderId) {
        // Get the last message from this sender in this conversation
        Pageable pageable = PageRequest.of(0, 1, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ChatMessage> messages = chatMessageRepository.findAllByConversationId(conversationId, pageable);

        if (messages.isEmpty()) {
            throw new AppException(ErrorCode.MESSAGE_NOT_FOUND);
        }

        ChatMessage lastMessage = messages.getContent().get(0);

        // Verify it's from the expected sender
        if (!lastMessage.getSenderId().equals(senderId)) {
            throw new AppException(ErrorCode.MESSAGE_NOT_FOUND);
        }

        // Get conversation and participants
        Conversation conversation = getConversation(conversationId);
        Set<String> participantIds = getParticipantIds(conversation);

        // Create response and broadcast
        ChatMessageResponse response = chatMessageMapper.toChatMessageResponse(lastMessage);
        UserDetail sender = getUserDetailById(lastMessage.getSenderId());
        response.setAvatar(sender.getAvatar());

        ChatMessageEventDTO event = ChatMessageEventDTO.builder()
                .response(response)
                .eventType(EventType.MESSAGE_CREATE)
                .participantsIds(participantIds)
                .build();

        producer.sendMessage(event);

        return response;
    }

    @Transactional
    @Override
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
                .readParticipantsId(new java.util.ArrayList<>())
                .build();
    }

    private ChatMessageResponse saveAndBroadcastMessage(ChatMessage chatMessage, Set<String> participantIds) {
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        ChatMessageResponse response = chatMessageMapper.toChatMessageResponse(savedMessage);

        // Add sender's avatar to the response
        UserDetail sender = getUserDetailById(savedMessage.getSenderId());
        response.setAvatar(sender.getAvatar());

        // Send via Kafka for real-time delivery to subscribed users
        ChatMessageEventDTO event = ChatMessageEventDTO.builder()
                .response(response)
                .eventType(EventType.MESSAGE_CREATE)
                .participantsIds(participantIds)
                .build();

        producer.sendMessage(event);

        // Also deliver directly via WebSocket to ensure offline users get the message
        // This ensures messages reach users even if they're not actively viewing the conversation
        messageDeliveryService.deliverMessageToConversation(savedMessage.getConversationId(), response);

        // Broadcast newest message for inbox updates
        newestMessageBroadcastService.broadcastNewestMessage(savedMessage.getConversationId(), response);

        return response;
    }

    private String participantHash(String participant1, String participant2) {
        String[] participants = {participant1, participant2};
        java.util.Arrays.sort(participants);
        return participants[0] + "_" + participants[1];
    }
}
