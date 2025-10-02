package com.hehe.thesocial.service.conversation;

import com.hehe.thesocial.dto.request.conversation.ConversationRequest;
import com.hehe.thesocial.dto.response.conversation.ConversationListResponse;
import com.hehe.thesocial.dto.response.conversation.ConversationResponse;
import com.hehe.thesocial.entity.Conversation;
import com.hehe.thesocial.entity.User;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.entity.enums.ConversationType;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.mapper.conversation.ConversationMapper;
import com.hehe.thesocial.repository.ConversationRepository;
import com.hehe.thesocial.repository.FileRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Set;


@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ConversationServiceImpl implements ConversationService {
    ConversationRepository conversationRepository;
    ConversationMapper conversationMapper;
    UserDetailRepository userDetailRepository;
    FileRepository fileRepository;

    @Transactional
    @Override
    public ConversationResponse createConversation(ConversationRequest request) {

        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        Conversation conversation = conversationMapper.toConversation(request);
        Set<UserDetail> userDetails = new HashSet<>();

        for (String participantId : request.getParticipantIds()) {
            UserDetail userDetail = userDetailRepository.findById(participantId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            if (userDetail.getUser().getId().equals(userId)) conversation.setCreatorId(userDetail.getId());

            userDetails.add(userDetail);
        }

        conversation.setUserDetails(userDetails);

        conversation = conversationRepository.save(conversation);
        return conversationMapper.toConversationResponse(conversation);
    }

    @Override
    public ConversationResponse getConversationById(String conversationId) {
        String userId  = SecurityContextHolder.getContext().getAuthentication().getName();

        UserDetail myUserDetail = userDetailRepository.findByUser_Id(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        ConversationResponse conversationResponse = conversationMapper.toConversationResponse(conversation);

        if (conversation.getConversationType() == ConversationType.DIRECT) {
            conversation.getUserDetails().forEach(userDetail -> {
                if (!userDetail.getId().equals(myUserDetail.getId())) {
                    conversationResponse.setAvatar(userDetail.getAvatar());
                    conversationResponse.setConversationName(userDetail.getDisplayName());
                }
            });
        }

        if (conversation.getConversationType() == ConversationType.GROUP) {
            // group chat
        }

        return conversationResponse;
    }


    @Transactional
    @Override
    public ConversationResponse updateConversation(String conversationId, ConversationRequest request) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        if (StringUtils.hasText(request.getAvatarId())) {
            conversation.setAvatar(fileRepository.findById(request.getAvatarId())
                    .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND)));
        }

        if (StringUtils.hasText(request.getConversationName())) {
            conversation.setConversationName(request.getConversationName());
        }

        if (StringUtils.hasText(request.getCreatorId())) {
            conversation.setCreatorId(request.getCreatorId());
        }

        return conversationMapper.toConversationResponse(conversation);

    }

    @Transactional
    @Override
    public ConversationResponse addMember(String conversationId, String newParticipantId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        UserDetail newParticipant = userDetailRepository.findById(newParticipantId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        conversation.getUserDetails().add(newParticipant);

        conversation = conversationRepository.save(conversation);
        return conversationMapper.toConversationResponse(conversation);
    }

    @Transactional
    @Override
    public ConversationResponse removeMember(String conversationId, String participantId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        UserDetail participant = userDetailRepository.findById(participantId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        conversation.getUserDetails().remove(participant);

        conversation = conversationRepository.save(conversation);
        return conversationMapper.toConversationResponse(conversation);
    }

    @Override
    public Page<ConversationListResponse> getMyConversations(Pageable pageable) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        UserDetail userDetail = userDetailRepository.findByUser_Id(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        Page<Conversation> conversations = conversationRepository.findByUserDetailsContaining(new HashSet<>(List.of(userDetail)),pageable);

        Page<ConversationListResponse> responseList = conversations.map(conversationMapper::toConversationListResponse);

        conversations.forEach(conversation -> {
            //set avt according to user if type = direct
            if (conversation.getConversationType() == ConversationType.DIRECT) {

                for (UserDetail userDetail1 : conversation.getUserDetails()) {

                    if (!userDetail.getId().equals(userDetail1.getId())) {

                        ConversationListResponse conversationListResponse = responseList.getContent()
                                .get(conversations.getContent().indexOf(conversation));

                        conversationListResponse.setAvatar(userDetail1.getAvatar());
                        conversationListResponse.setConversationName(userDetail1.getDisplayName());
                    }
                }
            }
        });

        return responseList;
    }

    @Override
    public void deleteConversation(String conversationId) {
        conversationRepository.deleteById(conversationId);
    }


}