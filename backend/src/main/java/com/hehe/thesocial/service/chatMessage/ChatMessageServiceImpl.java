package com.hehe.thesocial.service.chatMessage;

import com.hehe.thesocial.dto.request.chat.ChatMessageCreationRequest;
import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.entity.ChatMessage;
import com.hehe.thesocial.entity.Conversation;
import com.hehe.thesocial.entity.User;
import com.hehe.thesocial.entity.UserDetail;
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

        UserDetail userDetail = userDetailRepository.findByUser(User.builder()
                        .id(userId)
                        .build())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("time").descending());

        Page<ChatMessage> chatMessages = chatMessageRepository.findAllByConversationId(conversationId, pageable);

        Page<ChatMessageResponse> chatMessageResponses = chatMessages.map(chatMessageMapper::toChatMessageResponse);

        chatMessageResponses.getContent().forEach(chatMessageResponse -> {
            chatMessageResponse.setSender(chatMessageResponse.getSender().equals(userDetail.getId()) ? "me" : "other");
        });

        return chatMessageResponses;
    }

    @Transactional
    public ChatMessageResponse createChatMessage(ChatMessageCreationRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        UserDetail userDetail = userDetailRepository.findByUser(User.builder()
                        .id(userId)
                        .build())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        Conversation conversation = conversationRepository.findById(request.getConversationId()).orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        Set<String> participantIds = conversation.getUserDetails().stream().map(UserDetail::getId).collect(Collectors.toSet());

        //check user co trong cuoc tro chuyen hay khong
        if (!participantIds.contains(userDetail.getId())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        ChatMessage chatMessage = chatMessageMapper.toChatMessage(request);
        chatMessage.setTime(LocalDateTime.now());
        chatMessage.setSender(userDetail.getId());
        chatMessage.setEdited(false);

        ChatMessage savedChatMessage = chatMessageRepository.save(chatMessage);

        ChatMessageResponse chatMessageResponse = chatMessageMapper.toChatMessageResponse(savedChatMessage);
        producer.sendMessage(chatMessageResponse);
        return chatMessageResponse;
    }

    public ChatMessageResponse updateChatMessage(ChatMessageCreationRequest request) {
        ChatMessage chatMessage = chatMessageMapper.toChatMessage(request);
        ChatMessage updatedChatMessage = chatMessageRepository.save(chatMessage);
        return chatMessageMapper.toChatMessageResponse(updatedChatMessage);
    }

    public void deleteChatMessage(String chatMessageId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        UserDetail userDetail = userDetailRepository.findByUser(User.builder()
                        .id(userId)
                        .build())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        if (chatMessageRepository.existsById(chatMessageId)) {
            ChatMessage chatMessage = chatMessageRepository.findById(chatMessageId).orElseThrow(() -> new AppException(ErrorCode.MESSAGE_NOT_FOUND));
            if (!chatMessage.getSender().equals(userDetail.getId())) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
        }

        chatMessageRepository.deleteById(chatMessageId);
    }

}
