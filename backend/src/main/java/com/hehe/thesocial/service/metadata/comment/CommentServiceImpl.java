package com.hehe.thesocial.service.metadata.comment;

import com.hehe.thesocial.dto.request.comment.CommentCreateRequest;
import com.hehe.thesocial.dto.response.comment.CommentCreateResponse;
import com.hehe.thesocial.dto.response.comment.CommentResponse;
import com.hehe.thesocial.dto.response.metadata.CommentActionResponse;
import com.hehe.thesocial.entity.Comment;
import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.MetaData;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.entity.UserInteraction;
import com.hehe.thesocial.entity.enums.InteractionType;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.repository.CommentRepository;
import com.hehe.thesocial.repository.FeedItemRepository;
import com.hehe.thesocial.repository.MetaDataRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.repository.UserInteractionRepository;
import com.hehe.thesocial.service.notification.NotificationService;
import com.hehe.thesocial.util.TimeFormatter;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Transactional(readOnly = true)
public class CommentServiceImpl implements CommentService {

    private static final ZoneOffset DEFAULT_ZONE_OFFSET = ZoneOffset.of("+07:00");

    CommentRepository commentRepository;
    FeedItemRepository feedItemRepository;
    MetaDataRepository metaDataRepository;
    UserDetailRepository userDetailRepository;
    UserInteractionRepository userInteractionRepository;
    NotificationService notificationService;

    @Override
    @Transactional
    public CommentCreateResponse addComment(String feedItemId, CommentCreateRequest request) {
        FeedItem feedItem = feedItemRepository.findById(feedItemId)
                .orElseThrow(() -> new AppException(ErrorCode.FEED_ITEM_NOT_FOUND));

        UserDetail commenter = userDetailRepository.findById(request.getUserDetailId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Comment comment = commentRepository.save(Comment.builder()
                .content(request.getContent())
                .userDetailId(commenter.getId())
                .feedItemId(feedItemId)
                .avatarUrl(commenter.getAvatar() != null ? commenter.getAvatar().getUrl() : null)
                .build());

        long totalComments = updateCommentCount(feedItem.getMetaData(), 1);
        recordCommentInteraction(feedItemId, request.getUserDetailId());
        notificationService.notifyCommentOnFeedItem(feedItem, comment, commenter);

        Map<String, UserDetail> commenters = Collections.singletonMap(commenter.getId(), commenter);
        log.info("Added new comment with id {} to feed item {}", comment.getId(), feedItemId);

        return CommentCreateResponse.builder()
                .comment(mapToCommentResponse(comment, request.getUserDetailId(), commenters))
                .totalComments(totalComments)
                .build();
    }

    @Override
    @Transactional
    public boolean removeComment(String commentId, String userDetailId) {
        Comment comment = getCommentOrThrow(commentId);

        if (!comment.getUserDetailId().equals(userDetailId)) {
            throw new AppException(ErrorCode.COMMENT_ACCESS_DENIED);
        }

        FeedItem feedItem = feedItemRepository.findById(comment.getFeedItemId())
                .orElseThrow(() -> new AppException(ErrorCode.FEED_ITEM_NOT_FOUND));

        updateCommentCount(feedItem.getMetaData(), -1);
        commentRepository.delete(comment);
        return true;
    }

    @Override
    @Transactional
    public CommentActionResponse likeComment(String commentId, String userDetailId) {
        Comment comment = getCommentOrThrow(commentId);

        Set<String> lovedBy = ensureMutableSet(comment.getLovedBy());
        Set<String> dislikedBy = ensureMutableSet(comment.getDislikedBy());

        if (lovedBy.contains(userDetailId)) {
            return buildActionResponse(comment, true, dislikedBy.contains(userDetailId));
        }

        if (dislikedBy.remove(userDetailId)) {
            comment.setDislikeCount(Math.max(0, comment.getDislikeCount() - 1));
        }

        lovedBy.add(userDetailId);
        comment.setLovedBy(lovedBy);
        comment.setDislikedBy(dislikedBy);
        comment.setLoveCount(comment.getLoveCount() + 1);
        commentRepository.save(comment);

        recordCommentInteraction(comment.getFeedItemId(), userDetailId);

        return buildActionResponse(comment, true, false);
    }

    @Override
    @Transactional
    public CommentActionResponse unlikeComment(String commentId, String userDetailId) {
        Comment comment = getCommentOrThrow(commentId);

        Set<String> lovedBy = ensureMutableSet(comment.getLovedBy());

        if (!lovedBy.remove(userDetailId)) {
            boolean stillDisliked = comment.getDislikedBy() != null && comment.getDislikedBy().contains(userDetailId);
            return buildActionResponse(comment, false, stillDisliked);
        }

        comment.setLovedBy(lovedBy);
        comment.setLoveCount(Math.max(0, comment.getLoveCount() - 1));
        commentRepository.save(comment);

        boolean stillDisliked = comment.getDislikedBy() != null && comment.getDislikedBy().contains(userDetailId);
        return buildActionResponse(comment, false, stillDisliked);
    }

    @Override
    @Transactional
    public CommentActionResponse dislikeComment(String commentId, String userDetailId) {
        Comment comment = getCommentOrThrow(commentId);

        Set<String> lovedBy = ensureMutableSet(comment.getLovedBy());
        Set<String> dislikedBy = ensureMutableSet(comment.getDislikedBy());

        if (dislikedBy.contains(userDetailId)) {
            return buildActionResponse(comment, lovedBy.contains(userDetailId), true);
        }

        if (lovedBy.remove(userDetailId)) {
            comment.setLoveCount(Math.max(0, comment.getLoveCount() - 1));
        }

        dislikedBy.add(userDetailId);
        comment.setLovedBy(lovedBy);
        comment.setDislikedBy(dislikedBy);
        comment.setDislikeCount(comment.getDislikeCount() + 1);
        commentRepository.save(comment);

        return buildActionResponse(comment, false, true);
    }

    @Override
    @Transactional
    public CommentActionResponse undislikeComment(String commentId, String userDetailId) {
        Comment comment = getCommentOrThrow(commentId);

        Set<String> dislikedBy = ensureMutableSet(comment.getDislikedBy());

        if (!dislikedBy.remove(userDetailId)) {
            boolean stillLiked = comment.getLovedBy() != null && comment.getLovedBy().contains(userDetailId);
            return buildActionResponse(comment, stillLiked, false);
        }

        comment.setDislikedBy(dislikedBy);
        comment.setDislikeCount(Math.max(0, comment.getDislikeCount() - 1));
        commentRepository.save(comment);

        boolean stillLiked = comment.getLovedBy() != null && comment.getLovedBy().contains(userDetailId);
        return buildActionResponse(comment, stillLiked, false);
    }

    @Override
    public CommentResponse getComment(String commentId, String currentUserDetailId) {
        Comment comment = getCommentOrThrow(commentId);
        Map<String, UserDetail> users = loadUserDetails(Collections.singletonList(comment));
        return mapToCommentResponse(comment, currentUserDetailId, users);
    }

    @Override
    public Page<CommentResponse> getCommentsByFeedItem(String feedItemId,
                                                       String currentUserDetailId,
                                                       Pageable pageable) {

        Page<Comment> commentsPage = commentRepository.findByFeedItemIdOrderByCreatedAtDesc(feedItemId, pageable);
        Map<String, UserDetail> userDetails = loadUserDetails(commentsPage.getContent());

        return commentsPage.map(comment -> mapToCommentResponse(comment, currentUserDetailId, userDetails));
    }

    private Comment getCommentOrThrow(String commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));
    }

    private long updateCommentCount(MetaData metaData, int delta) {
        if (metaData == null) {
            log.warn("Feed item metadata missing when updating comments count, skipping update");
            return 0L;
        }

        long current = metaData.getCommentsCount() != null ? metaData.getCommentsCount() : 0L;
        long updated = Math.max(0, current + delta);
        metaData.setCommentsCount(updated);
        metaDataRepository.save(metaData);
        return updated;
    }

    private void recordCommentInteraction(String feedItemId, String userDetailId) {
        userInteractionRepository.save(UserInteraction.builder()
                .interactionType(InteractionType.COMMENT)
                .feedItemId(feedItemId)
                .userDetailId(userDetailId)
                .build());
    }

    private Set<String> ensureMutableSet(Set<String> source) {
        return source == null ? new HashSet<>() : new HashSet<>(source);
    }

    private CommentActionResponse buildActionResponse(Comment comment, boolean liked, boolean disliked) {
        return CommentActionResponse.builder()
                .liked(liked)
                .disliked(disliked)
                .likeCount(comment.getLoveCount())
                .dislikeCount(comment.getDislikeCount())
                .build();
    }

    private Map<String, UserDetail> loadUserDetails(Collection<Comment> comments) {
        Set<String> userIds = comments.stream()
                .map(Comment::getUserDetailId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (userIds.isEmpty()) {
            return Collections.emptyMap();
        }

        List<UserDetail> users = userDetailRepository.findAllById(userIds);
        return users.stream()
                .collect(Collectors.toMap(UserDetail::getId, userDetail -> userDetail));
    }

    private CommentResponse mapToCommentResponse(Comment comment,
                                                 String currentUserDetailId,
                                                 Map<String, UserDetail> userDetailsById) {
        boolean isLiked = comment.getLovedBy() != null && comment.getLovedBy().contains(currentUserDetailId);
        UserDetail owner = userDetailsById != null ? userDetailsById.get(comment.getUserDetailId()) : null;

        Instant createdInstant = comment.getCreatedAt() != null
                ? comment.getCreatedAt().toInstant(DEFAULT_ZONE_OFFSET)
                : null;
        Instant updatedInstant = comment.getUpdatedAt() != null
                ? comment.getUpdatedAt().toInstant(DEFAULT_ZONE_OFFSET)
                : null;

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .likeCount(comment.getLoveCount())
                .dislikeCount(comment.getDislikeCount())
                .replyCount(comment.getReplyCount())
                .userDetailId(comment.getUserDetailId())
                .username(resolveUsername(owner))
                .avatarUrl(resolveAvatarUrl(comment, owner))
                .createdAt(createdInstant)
                .updatedAt(updatedInstant)
                .isLikedByCurrentUser(isLiked)
                .timeAgo(TimeFormatter.formatTimeAgo(createdInstant))
                .build();
    }

    private String resolveUsername(UserDetail userDetail) {
        if (userDetail == null) {
            return "User";
        }

        if (userDetail.getDisplayName() != null && !userDetail.getDisplayName().isBlank()) {
            return userDetail.getDisplayName();
        }

        if (userDetail.getShownName() != null && !userDetail.getShownName().isBlank()) {
            return userDetail.getShownName();
        }

        return "User";
    }

    private String resolveAvatarUrl(Comment comment, UserDetail owner) {
        if (comment.getAvatarUrl() != null) {
            return comment.getAvatarUrl();
        }

        if (owner != null && owner.getAvatar() != null) {
            return owner.getAvatar().getUrl();
        }

        return null;
    }
}
