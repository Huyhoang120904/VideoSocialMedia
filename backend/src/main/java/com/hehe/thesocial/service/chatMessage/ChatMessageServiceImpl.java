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

    public Page<ChatMessageResponse> getAllChatMessageByConversationId(String conversationId, Pageable pageable) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        UserDetail userDetail = userDetailRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        // Validate that the conversation exists and user is a participant
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        Set<String> participantIds = conversation.getUserDetails().stream()
                .map(UserDetail::getId)
                .collect(Collectors.toSet());

        if (!participantIds.contains(userDetail.getId())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("time").descending());

        Page<ChatMessage> chatMessages = chatMessageRepository.findAllByConversationId(conversationId, pageable);

        Page<ChatMessageResponse> chatMessageResponses = chatMessages.map(chatMessageMapper::toChatMessageResponse);

        chatMessageResponses.getContent().forEach(chatMessageResponse -> {
            chatMessageResponse.setSender(chatMessageResponse.getSender().equals(userDetail.getId()) ? "me" : "other");
        });

        return chatMessageResponses;
    }

    @Transactional
    public ChatMessageResponse createDirectChatMessage(DirectChatMessageRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        UserDetail userDetail = userDetailRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        UserDetail receiverDetail = userDetailRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Find or create conversation for direct messaging
        String hash = participantHash(userDetail.getId(), request.getReceiverId());
        Conversation conversation = conversationRepository.findByParticipantHash(hash).orElseGet(
                () -> conversationRepository.save(Conversation.builder().conversationType(ConversationType.DIRECT)
                        .participantHash(hash).userDetails(Set.of(userDetail, receiverDetail)).build()));

        Set<String> participantIds = conversation.getUserDetails().stream().map(UserDetail::getId)
                .collect(Collectors.toSet());

        // Validate user is participant in the conversation
        if (!participantIds.contains(userDetail.getId())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        ChatMessage chatMessage = ChatMessage.builder().message(request.getMessage())
                .conversationId(conversation.getConversationId()).edited(false).senderId(userDetail.getId())
                .time(LocalDateTime.now())

                .build();

        ChatMessage savedChatMessage = chatMessageRepository.save(chatMessage);

        ChatMessageResponse chatMessageResponse = chatMessageMapper.toChatMessageResponse(savedChatMessage);

        producer.sendMessage(ChatMessageEventDTO.builder().response(chatMessageResponse)
                .eventType(EventType.MESSAGE_CREATE).participantsIds(participantIds).build());

        return chatMessageResponse;
    }

    public ChatMessageResponse createGroupChatMessage(GroupChatMessageRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        UserDetail userDetail = userDetailRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        Conversation conversation = conversationRepository.findById(request.getGroupId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Validate that the conversation is a group chat and user is a participant
        if (conversation.getConversationType() != ConversationType.GROUP) {
            throw new AppException(ErrorCode.INVALID_CONVERSATION_TYPE);
        }

        boolean isParticipant = conversation.getUserDetails().stream()
                .anyMatch(participant -> participant.getId().equals(userDetail.getId()));

        if (!isParticipant) {
            throw new AppException(ErrorCode.CONVERSATION_ACCESS_DENIED);
        }

        ChatMessage chatMessage = ChatMessage.builder().message(request.getMessage())
                .conversationId(conversation.getConversationId()).edited(false).senderId(userDetail.getId())
                .time(LocalDateTime.now())
                .build();

        ChatMessage savedChatMessage = chatMessageRepository.save(chatMessage);

        ChatMessageResponse chatMessageResponse = chatMessageMapper.toChatMessageResponse(savedChatMessage);

        Set<String> participantIds = conversation.getUserDetails().stream().map(UserDetail::getId)
                .collect(Collectors.toSet());

        producer.sendMessage(ChatMessageEventDTO.builder().response(chatMessageResponse).participantsIds(participantIds)
                .eventType(EventType.MESSAGE_CREATE).build());

        return chatMessageResponse;
    }

    public ChatMessageResponse updateChatMessage(String chatMessageId, ChatMessageUpdateRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        UserDetail userDetail = userDetailRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        // Validate chat message exists and belongs to the sender
        ChatMessage existingChatMessage = chatMessageRepository.findById(chatMessageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        if (!existingChatMessage.getSenderId().equals(userDetail.getId())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // Validate user is still a participant in the conversation
        Conversation conversation = conversationRepository.findById(existingChatMessage.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        Set<String> participantIds = conversation.getUserDetails().stream().map(UserDetail::getId)
                .collect(Collectors.toSet());

        if (!participantIds.contains(userDetail.getId())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // Update the message
        existingChatMessage.setMessage(request.getMessage());
        existingChatMessage.setEdited(true);
        existingChatMessage.setTime(LocalDateTime.now()); // Update timestamp for edited message

        ChatMessage updatedChatMessage = chatMessageRepository.save(existingChatMessage);

        return chatMessageMapper.toChatMessageResponse(updatedChatMessage);
    }

    public void deleteChatMessage(String chatMessageId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        UserDetail userDetail = userDetailRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        // Validate chat message exists and belongs to the sender
        ChatMessage chatMessage = chatMessageRepository.findById(chatMessageId)
                .orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));

        if (!chatMessage.getSenderId().equals(userDetail.getId())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // Validate user is still a participant in the conversation
        Conversation conversation = conversationRepository.findById(chatMessage.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        Set<String> participantIds = conversation.getUserDetails().stream().map(UserDetail::getId)
                .collect(Collectors.toSet());

        if (!participantIds.contains(userDetail.getId())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        chatMessageRepository.deleteById(chatMessageId);
    }

    public String participantHash(String participant1, String participant2) {
        String[] participants = { participant1, participant2 };
        java.util.Arrays.sort(participants);

        return participants[0] + "_" + participants[1];
    }

}
