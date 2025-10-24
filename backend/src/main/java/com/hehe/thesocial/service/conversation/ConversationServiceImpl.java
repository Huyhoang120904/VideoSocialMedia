package com.hehe.thesocial.service.conversation;

import com.hehe.thesocial.dto.request.conversation.ConversationRequest;
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
import java.util.stream.Collectors;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ConversationServiceImpl implements ConversationService {
    static int MIN_CONVERSATION_PARTICIPANTS = 2;

    ConversationRepository conversationRepository;
    ConversationMapper conversationMapper;
    UserDetailRepository userDetailRepository;
    FileRepository fileRepository;
    UserRepository userRepository;


    @Transactional
    @Override
    public ConversationResponse createConversation(ConversationRequest request) {
        String userId = getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        UserDetail userDetail = userDetailRepository.findByUser(user)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        String currentUserId = userDetail.getId();

        List<String> participantIds = request.getParticipantIds();

        Set<UserDetail> participants = new HashSet<>(getParticipants(participantIds));

        validateParticipantCount(participants);

        // Check for existing conversation with same participants for direct conversations
        // If exists, return the existing one instead of creating a new one
        if (participants.size() == 2) {
            List<String> sortedParticipantIds = participants.stream()
                    .map(UserDetail::getId)
                    .sorted()
                    .collect(Collectors.toList());

            String hash = participantHash(sortedParticipantIds.get(0), sortedParticipantIds.get(1));

            return conversationRepository.findByParticipantHash(hash)
                    .map(existingConversation -> {
                        log.info("Found existing conversation with ID: {}", existingConversation.getConversationId());
                        return conversationMapper.toConversationResponse(existingConversation);
                    })
                    .orElseGet(() -> {
                        // Create new conversation if not found
                        return createNewConversation(request, participants, currentUserId, sortedParticipantIds, hash);
                    });
        }

        // For group conversations, create new one
        Conversation conversation = conversationMapper.toConversation(request);

        setCreatorId(conversation, participants, currentUserId);
        conversation.setUserDetails(participants);
        conversation.setConversationType(determineConversationType(participants.size()));

        conversation = conversationRepository.save(conversation);
        log.info("Created conversation with ID: {} and {} participants", conversation.getConversationId(),
                participants.size());

        return conversationMapper.toConversationResponse(conversation);
    }

    @Override
    public ConversationResponse getConversationById(String conversationId) {
        UserDetail currentUserDetail = getCurrentUserDetail();
        Conversation conversation = findConversationById(conversationId);

        ConversationResponse response = conversationMapper.toConversationResponse(conversation);
        customizeConversationResponse(response, conversation, currentUserDetail);

        return response;
    }


    @Transactional
    @Override
    public ConversationResponse updateConversation(String conversationId, ConversationRequest request) {
        Conversation conversation = findConversationById(conversationId);

        updateConversationFields(conversation, request);

        conversation = conversationRepository.save(conversation);
        log.info("Updated conversation with ID: {}", conversationId);

        return conversationMapper.toConversationResponse(conversation);
    }

    @Transactional
    @Override
    public ConversationResponse addMember(String conversationId, String newParticipantId) {
        Conversation conversation = findConversationById(conversationId);
        UserDetail newParticipant = findUserDetailById(newParticipantId);

        validateMemberNotInConversation(conversation, newParticipant);

        conversation.getUserDetails().add(newParticipant);

        // Update conversation type if needed
        if (conversation.getUserDetails().size() > 2 && conversation.getConversationType() == ConversationType.DIRECT) {
            conversation.setConversationType(ConversationType.GROUP);
        }

        conversation = conversationRepository.save(conversation);
        log.info("Added member {} to conversation {}", newParticipantId, conversationId);

        return conversationMapper.toConversationResponse(conversation);
    }

    @Transactional
    @Override
    public ConversationResponse removeMember(String conversationId, String participantId) {
        Conversation conversation = findConversationById(conversationId);
        UserDetail participant = findUserDetailById(participantId);

        validateMemberInConversation(conversation, participant);
        validateMinimumParticipants(conversation);

        conversation.getUserDetails().remove(participant);

        // Update conversation type if needed
        if (conversation.getUserDetails().size() == 2 && conversation.getConversationType() == ConversationType.GROUP) {
            conversation.setConversationType(ConversationType.DIRECT);
        }

        conversation = conversationRepository.save(conversation);
        log.info("Removed member {} from conversation {}", participantId, conversationId);

        return conversationMapper.toConversationResponse(conversation);
    }

    @Override
    public Page<ConversationResponse> getMyConversations(Pageable pageable) {
        UserDetail currentUserDetail = getCurrentUserDetail();

        Page<Conversation> conversations = conversationRepository
                .findByUserDetailsContaining(Set.of(currentUserDetail), pageable);

        return conversations.map(conversation -> {
            ConversationResponse response = conversationMapper.toConversationResponse(conversation);
            customizeConversationResponse(response, conversation, currentUserDetail);
            return response;
        });
    }

    @Transactional
    @Override
    public void deleteConversation(String conversationId) {
        if (!conversationRepository.existsById(conversationId)) {
            throw new AppException(ErrorCode.CONVERSATION_NOT_FOUND);
        }

        conversationRepository.deleteById(conversationId);
        log.info("Deleted conversation with ID: {}", conversationId);
    }

    // Helper methods

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private UserDetail getCurrentUserDetail() {
        String userId = getCurrentUserId();
        return userDetailRepository.findByUser(User.builder().id(userId).build())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
    }

    private Conversation findConversationById(String conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
        if (conversation == null) {
            throw new AppException(ErrorCode.CONVERSATION_NOT_FOUND);
        }
        return conversation;
    }

    private UserDetail findUserDetailById(String userDetailId) {
        return userDetailRepository.findById(userDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private void validateParticipantCount(Set<UserDetail> participants) {
        if (participants == null || participants.size() < MIN_CONVERSATION_PARTICIPANTS) {
            throw new AppException(ErrorCode.INVALID_CONVERSATION_PARTICIPANTS);
        }
    }

    private List<UserDetail> getParticipants(List<String> participantIds) {
        List<UserDetail> userDetails = userDetailRepository.findAllById(participantIds);
        return userDetails;
    }

    private void setCreatorId(Conversation conversation, Set<UserDetail> participants, String currentUserId) {
        participants.stream()
                .filter(participant -> participant.getId().equals(currentUserId))
                .findFirst()
                .ifPresent(creator -> conversation.setCreatorId(creator.getId()));
    }

    private ConversationType determineConversationType(int participantCount) {
        return participantCount == 2 ? ConversationType.DIRECT : ConversationType.GROUP;
    }

    private void customizeConversationResponse(ConversationResponse response, Conversation conversation,
                                               UserDetail currentUserDetail) {
        if (conversation.getConversationType() == ConversationType.DIRECT) {
            conversation.getUserDetails().stream()
                    .filter(userDetail -> !userDetail.getId().equals(currentUserDetail.getId()))
                    .findFirst()
                    .ifPresent(otherUser -> {
                        response.setAvatar(otherUser.getAvatar());
                        response.setConversationName(otherUser.getDisplayName());
                    });
        }
        // Group chat customization can be added here if needed
    }

    private void updateConversationFields(Conversation conversation, ConversationRequest request) {
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
    }

    private void validateMemberNotInConversation(Conversation conversation, UserDetail userDetail) {
        if (conversation.getUserDetails().contains(userDetail)) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
    }

    private void validateMemberInConversation(Conversation conversation, UserDetail userDetail) {
        if (!conversation.getUserDetails().contains(userDetail)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
    }

    private void validateMinimumParticipants(Conversation conversation) {
        if (conversation.getUserDetails().size() <= MIN_CONVERSATION_PARTICIPANTS) {
            throw new AppException(ErrorCode.INVALID_CONVERSATION_PARTICIPANTS);
        }
    }


    private void validateNoDuplicateConversation(Set<UserDetail> participants) {
        // Only check for direct conversations (2 participants)
        if (participants.size() == 2) {
            List<String> participantIds = participants.stream()
                    .map(UserDetail::getId)
                    .sorted()
                    .collect(Collectors.toList());

            String hash = participantHash(participantIds.get(0), participantIds.get(1));

            if (conversationRepository.findByParticipantHash(hash).isPresent()) {
                throw new AppException(ErrorCode.CONVERSATION_ALREADY_EXISTS);
            }
        }
    }

    private ConversationResponse createNewConversation(ConversationRequest request, Set<UserDetail> participants,
                                                       String currentUserId, List<String> participantIds, String hash) {
        Conversation conversation = conversationMapper.toConversation(request);

        setCreatorId(conversation, participants, currentUserId);
        conversation.setUserDetails(participants);
        conversation.setConversationType(ConversationType.DIRECT);
        conversation.setParticipantHash(hash);

        conversation = conversationRepository.save(conversation);
        log.info("Created conversation with ID: {} and {} participants", conversation.getConversationId(),
                participants.size());

        return conversationMapper.toConversationResponse(conversation);
    }

    private String participantHash(String participant1, String participant2) {
        String[] participants = {participant1, participant2};
        java.util.Arrays.sort(participants);
        return participants[0] + "_" + participants[1];
    }
}
