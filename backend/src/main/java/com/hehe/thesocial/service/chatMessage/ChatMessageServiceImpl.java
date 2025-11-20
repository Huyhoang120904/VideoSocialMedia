package com.hehe.thesocial.service.chatMessage;



import com.hehe.thesocial.dto.request.chat.ChatMessageUpdateRequest;
import com.hehe.thesocial.dto.request.chat.DirectChatMessageRequest;
import com.hehe.thesocial.dto.request.chat.GroupChatMessageRequest;
import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.entity.ChatMessage;
import com.hehe.thesocial.entity.Conversation;
import com.hehe.thesocial.entity.FileDocument;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.entity.enums.ChatMessageType;
import com.hehe.thesocial.entity.enums.ConversationType;
import com.hehe.thesocial.dto.event.ReadStatusEventDTO;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.mapper.chatMessage.ChatMessageMapper;
import com.hehe.thesocial.repository.ChatMessageRepository;
import com.hehe.thesocial.repository.ConversationRepository;
import com.hehe.thesocial.repository.FileRepository;
import com.hehe.thesocial.repository.UserDetailRepository;

import com.hehe.thesocial.service.file.FileService;
import com.hehe.thesocial.service.messageDelivery.MessageDeliveryService;
import com.hehe.thesocial.service.messageDelivery.NewestMessageBroadcastService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.hehe.thesocial.util.AuthenticationHelper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
    UserDetailRepository userDetailRepository;
    ConversationRepository conversationRepository;
    FileRepository fileRepository;
    FileService fileService;
    MessageDeliveryService messageDeliveryService;
    NewestMessageBroadcastService newestMessageBroadcastService;
    AuthenticationHelper authenticationHelper;
    SimpMessagingTemplate simpMessagingTemplate;

    @Override
    public Page<ChatMessageResponse> getAllChatMessageByConversationId(String conversationId, Pageable pageable) {
        UserDetail currentUser = authenticationHelper.getCurrentUserDetail();
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
        UserDetail sender = authenticationHelper.getCurrentUserDetail();
        UserDetail receiver = getUserDetailById(request.getReceiverId());

        Conversation conversation = findOrCreateDirectConversation(sender, receiver);
        Set<String> participantIds = getParticipantIds(conversation);

        FileDocument attachment = resolveAttachment(request.getFileId());
        validateMessagePayload(request.getMessage(), attachment, request.getMessageType(), request.getFeedItemId());

        ChatMessageType messageType = resolveMessageType(request.getMessageType(), attachment);
        String messageContent = normalizeMessageContent(request.getMessage(), attachment);

        ChatMessage chatMessage = buildChatMessage(
                messageContent,
                conversation.getConversationId(),
                sender.getId(),
                messageType,
                attachment,
                request.getFeedItemId()
        );

        return saveAndBroadcastMessage(chatMessage, participantIds);
    }

    @Transactional
    @Override
    public ChatMessageResponse createGroupChatMessage(GroupChatMessageRequest request) {
        UserDetail sender = authenticationHelper.getCurrentUserDetail();
        Conversation conversation = getConversation(request.getGroupId());

        validateGroupConversation(conversation);
        validateUserIsParticipant(conversation, sender.getId());

        FileDocument attachment = resolveAttachment(request.getFileId());
        validateMessagePayload(request.getMessage(), attachment, request.getMessageType(), request.getFeedItemId());

        ChatMessageType messageType = resolveMessageType(request.getMessageType(), attachment);
        String messageContent = normalizeMessageContent(request.getMessage(), attachment);

        ChatMessage chatMessage = buildChatMessage(
                messageContent,
                conversation.getConversationId(),
                sender.getId(),
                messageType,
                attachment,
                request.getFeedItemId()
        );

        Set<String> participantIds = getParticipantIds(conversation);
        return saveAndBroadcastMessage(chatMessage, participantIds);
    }

    @Transactional
    @Override
    public ChatMessageResponse sendAttachment(String conversationId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }

        UserDetail sender = authenticationHelper.getCurrentUserDetail();
        Conversation conversation = getConversation(conversationId);

        validateUserIsParticipant(conversation, sender.getId());

        FileResponse storedFile = fileService.storeFile(file);
        FileDocument attachment = resolveAttachment(storedFile.getId());

        ChatMessageType messageType = resolveMessageType(null, attachment);
        String messageContent = normalizeMessageContent(null, attachment);

        ChatMessage chatMessage = buildChatMessage(
                messageContent,
                conversation.getConversationId(),
                sender.getId(),
                messageType,
                attachment,
                null
        );

        Set<String> participantIds = getParticipantIds(conversation);
        return saveAndBroadcastMessage(chatMessage, participantIds);
    }

    @Transactional
    @Override
    public ChatMessageResponse updateChatMessage(String chatMessageId, ChatMessageUpdateRequest request) {
        UserDetail currentUser = authenticationHelper.getCurrentUserDetail();
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
        UserDetail currentUser = authenticationHelper.getCurrentUserDetail();
        ChatMessage chatMessage = getChatMessage(chatMessageId);

        validateMessageOwnership(chatMessage, currentUser.getId());

        Conversation conversation = getConversation(chatMessage.getConversationId());
        validateUserIsParticipant(conversation, currentUser.getId());

        chatMessageRepository.deleteById(chatMessageId);
    }

    @Transactional
    @Override
    public ChatMessageResponse markMessageAsRead(String messageId) {
        UserDetail currentUser = authenticationHelper.getCurrentUserDetail();
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

        // Broadcast read status update to all participants
        broadcastReadStatusUpdate(conversation, messageId, currentUser.getId());

        return chatMessageMapper.toChatMessageResponse(message);
    }

    @Transactional
    @Override
    public void markConversationMessagesAsRead(String conversationId) {
        UserDetail currentUser = authenticationHelper.getCurrentUserDetail();
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

            // Broadcast read status for each updated message
            for (ChatMessage message : unreadMessages) {
                broadcastReadStatusUpdate(conversation, message.getId(), currentUser.getId());
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



        return response;
    }

    @Transactional
    @Override
    public ChatMessageResponse sendMessageToCurrentUser(String senderId, String message) {
        UserDetail receiver = authenticationHelper.getCurrentUserDetail();
        UserDetail sender = getUserDetailByUserId(senderId);

        Conversation conversation = findOrCreateDirectConversation(sender, receiver);
        Set<String> participantIds = getParticipantIds(conversation);

        ChatMessage chatMessage = buildChatMessage(
                message,
                conversation.getConversationId(),
                sender.getId(),
                ChatMessageType.TEXT,
                null,
                null
        );

        return saveAndBroadcastMessage(chatMessage, participantIds);
    }

    // ============ Private Helper Methods ============


    private UserDetail getUserDetailById(String userDetailId) {
        return userDetailRepository.findById(userDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private UserDetail getUserDetailByUserId(String userId) {
        return userDetailRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private FileDocument resolveAttachment(String fileId) {
        if (fileId == null || fileId.isBlank()) {
            return null;
        }
        return fileRepository.findById(fileId)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
    }

    private void validateMessagePayload(String message, FileDocument attachment, ChatMessageType messageType, String feedItemId) {
        // SHARED_VIDEO messages only need feedItemId
        if (messageType == ChatMessageType.SHARED_VIDEO) {
            if (feedItemId == null || feedItemId.isBlank()) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
            return;
        }
        
        // Other message types need either message text or attachment
        boolean hasMessage = message != null && !message.isBlank();
        if (!hasMessage && attachment == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private ChatMessageType resolveMessageType(ChatMessageType requestedType, FileDocument attachment) {
        if (requestedType != null) {
            return requestedType;
        }
        if (attachment != null && attachment.getResourceType() != null) {
            return switch (attachment.getResourceType().toLowerCase()) {
                case "image" -> ChatMessageType.IMAGE;
                case "video" -> ChatMessageType.VIDEO;
                default -> ChatMessageType.TEXT;
            };
        }
        return ChatMessageType.TEXT;
    }

    private String normalizeMessageContent(String message, FileDocument attachment) {
        if (message != null && !message.isBlank()) {
            return message;
        }
        if (attachment != null) {
            return attachment.getOriginalFileName();
        }
        return null;
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

    private ChatMessage buildChatMessage(String message,
                                         String conversationId,
                                         String senderId,
                                         ChatMessageType messageType,
                                         FileDocument fileDocument,
                                         String feedItemId) {
        return ChatMessage.builder()
                .message(message)
                .conversationId(conversationId)
                .senderId(senderId)
                .edited(false)
                .fileDocument(fileDocument)
                .readParticipantsId(new java.util.ArrayList<>())
                .messageType(messageType)
                .feedItemId(feedItemId)
                .build();
    }

    private ChatMessageResponse saveAndBroadcastMessage(ChatMessage chatMessage, Set<String> participantIds) {
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        ChatMessageResponse response = chatMessageMapper.toChatMessageResponse(savedMessage);

        // Add sender's avatar to the response
        UserDetail sender = getUserDetailById(savedMessage.getSenderId());
        response.setAvatar(sender.getAvatar());



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

    private void broadcastReadStatusUpdate(Conversation conversation, String messageId, String readerId) {
        ReadStatusEventDTO readStatusEventDTO = new ReadStatusEventDTO(messageId, conversation.getConversationId(), readerId);
        String destination = "/queue/read-status";

        for (UserDetail participant : conversation.getUserDetails()) {
            try {
                simpMessagingTemplate.convertAndSendToUser(participant.getId(), destination, readStatusEventDTO);
            } catch (Exception e) {
                // Log error or handle failed delivery
            }
        }
    }
}
