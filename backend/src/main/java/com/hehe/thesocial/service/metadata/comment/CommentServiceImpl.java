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
import java.util.*;
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

    // -------------------------
    // ADD COMMENT (SUPPORT REPLY)
    // -------------------------
    @Override
    @Transactional
    public CommentCreateResponse addComment(String feedItemId, CommentCreateRequest request) {

        FeedItem feedItem = feedItemRepository.findById(feedItemId)
                .orElseThrow(() -> new AppException(ErrorCode.FEED_ITEM_NOT_FOUND));

        UserDetail commenter = userDetailRepository.findById(request.getUserDetailId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Parent comment (reply)
        String parentCommentId = request.getParentCommentId();
        if (parentCommentId != null && !parentCommentId.isBlank()) {
            Comment parent = commentRepository.findById(parentCommentId)
                    .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

            if (!Objects.equals(parent.getFeedItemId(), feedItemId)) {
                throw new AppException(ErrorCode.UNCATEGORIZED);
            }
        }

        // Save new comment
        Comment comment = commentRepository.save(
                Comment.builder()
                        .content(request.getContent())
                        .userDetailId(commenter.getId())
                        .feedItemId(feedItemId)
                        .parentCommentId(parentCommentId)
                        .avatarUrl(commenter.getAvatar() != null ? commenter.getAvatar().getUrl() : null)
                        .replyCount(0)
                        .loveCount(0L)
                        .dislikeCount(0L)
                        .lovedBy(new HashSet<>())
                        .dislikedBy(new HashSet<>())
                        .build()
        );

        // If reply => increase parent's replyCount
        if (parentCommentId != null && !parentCommentId.isBlank()) {
            Comment parent = commentRepository.findById(parentCommentId)
                    .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));
            parent.setReplyCount(parent.getReplyCount() + 1);
            commentRepository.save(parent);
        }

        long totalComments = updateCommentCount(feedItem.getMetaData(), 1);
        recordCommentInteraction(feedItemId, request.getUserDetailId());
        notificationService.notifyCommentOnFeedItem(feedItem, comment, commenter);

        return CommentCreateResponse.builder()
                .comment(mapToCommentResponse(comment, request.getUserDetailId(),
                        Collections.singletonMap(commenter.getId(), commenter)))
                .totalComments(totalComments)
                .build();
    }

    // -------------------------
    // REMOVE COMMENT
    // -------------------------
    @Override
    @Transactional
    public boolean removeComment(String commentId, String userDetailId) {

        Comment comment = getCommentOrThrow(commentId);

        if (!Objects.equals(comment.getUserDetailId(), userDetailId)) {
            throw new AppException(ErrorCode.COMMENT_ACCESS_DENIED);
        }

        FeedItem feedItem = feedItemRepository.findById(comment.getFeedItemId())
                .orElseThrow(() -> new AppException(ErrorCode.FEED_ITEM_NOT_FOUND));

        updateCommentCount(feedItem.getMetaData(), -1);
        commentRepository.delete(comment);

        return true;
    }

    // -------------------------
    // LIKE / UNLIKE / DISLIKE / UNDISLIKE
    // -------------------------
    @Override
    @Transactional
    public CommentActionResponse likeComment(String commentId, String userDetailId) {
        Comment comment = getCommentOrThrow(commentId);

        Set<String> lovedBy = ensureMutable(comment.getLovedBy());
        Set<String> dislikedBy = ensureMutable(comment.getDislikedBy());

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

        Set<String> lovedBy = ensureMutable(comment.getLovedBy());

        if (!lovedBy.remove(userDetailId)) {
            boolean disliked = comment.getDislikedBy() != null &&
                    comment.getDislikedBy().contains(userDetailId);
            return buildActionResponse(comment, false, disliked);
        }

        comment.setLovedBy(lovedBy);
        comment.setLoveCount(Math.max(0, comment.getLoveCount() - 1));
        commentRepository.save(comment);

        boolean disliked = comment.getDislikedBy() != null &&
                comment.getDislikedBy().contains(userDetailId);
        return buildActionResponse(comment, false, disliked);
    }

    @Override
    @Transactional
    public CommentActionResponse dislikeComment(String commentId, String userDetailId) {
        Comment comment = getCommentOrThrow(commentId);

        Set<String> lovedBy = ensureMutable(comment.getLovedBy());
        Set<String> dislikedBy = ensureMutable(comment.getDislikedBy());

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

        Set<String> dislikedBy = ensureMutable(comment.getDislikedBy());

        if (!dislikedBy.remove(userDetailId)) {
            boolean liked = comment.getLovedBy() != null &&
                    comment.getLovedBy().contains(userDetailId);
            return buildActionResponse(comment, liked, false);
        }

        comment.setDislikedBy(dislikedBy);
        comment.setDislikeCount(Math.max(0, comment.getDislikeCount() - 1));
        commentRepository.save(comment);

        boolean liked = comment.getLovedBy() != null &&
                comment.getLovedBy().contains(userDetailId);
        return buildActionResponse(comment, liked, false);
    }

    // -------------------------
    // GET COMMENT(S)
    // -------------------------
    @Override
    public CommentResponse getComment(String commentId, String currentUserDetailId) {
        Comment comment = getCommentOrThrow(commentId);
        Map<String, UserDetail> map = loadUserDetails(Collections.singletonList(comment));
        return mapToCommentResponse(comment, currentUserDetailId, map);
    }

    @Override
    public Page<CommentResponse> getCommentsByFeedItem(
            String feedItemId, String currentUserDetailId, Pageable pageable) {

        Page<Comment> page = commentRepository
                .findByFeedItemIdAndParentCommentIdIsNullOrderByCreatedAtDesc(feedItemId, pageable);

        Map<String, UserDetail> users = loadUserDetails(page.getContent());

        return page.map(c -> mapToCommentResponse(c, currentUserDetailId, users));
    }

    @Override
    public Page<CommentResponse> getRepliesByCommentId(String parentCommentId, String currentUserDetailId, int page, int size) {
        return null;
    }

    @Override
    public Page<CommentResponse> getRepliesByCommentId(
            String parentCommentId, String currentUserDetailId, Pageable pageable) {

        Page<Comment> page = commentRepository
                .findByFeedItemIdAndParentCommentIdIsNullOrderByCreatedAtDesc(parentCommentId, pageable);

        Map<String, UserDetail> users = loadUserDetails(page.getContent());

        return page.map(c -> mapToCommentResponse(c, currentUserDetailId, users));
    }

    // -------------------------
    // HELPERS
    // -------------------------
    private Comment getCommentOrThrow(String id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));
    }

    private long updateCommentCount(MetaData meta, int delta) {
        if (meta == null) return 0;

        long current = meta.getCommentsCount() == null ? 0 : meta.getCommentsCount();
        long updated = Math.max(0, current + delta);

        meta.setCommentsCount(updated);
        metaDataRepository.save(meta);

        return updated;
    }

    private void recordCommentInteraction(String feedItemId, String userDetailId) {
        userInteractionRepository.save(UserInteraction.builder()
                .interactionType(InteractionType.COMMENT)
                .feedItemId(feedItemId)
                .userDetailId(userDetailId)
                .build());
    }

    private Set<String> ensureMutable(Set<String> set) {
        return set == null ? new HashSet<>() : new HashSet<>(set);
    }

    private CommentActionResponse buildActionResponse(Comment c, boolean liked, boolean disliked) {
        return CommentActionResponse.builder()
                .liked(liked)
                .disliked(disliked)
                .likeCount(c.getLoveCount())
                .dislikeCount(c.getDislikeCount())
                .build();
    }

    private Map<String, UserDetail> loadUserDetails(Collection<Comment> comments) {
        Set<String> ids = comments.stream()
                .map(Comment::getUserDetailId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (ids.isEmpty()) return Collections.emptyMap();

        List<UserDetail> users = userDetailRepository.findAllById(ids);
        return users.stream().collect(Collectors.toMap(UserDetail::getId, u -> u));
    }

    private CommentResponse mapToCommentResponse(
            Comment c, String currentUserId, Map<String, UserDetail> users) {

        UserDetail owner = users.get(c.getUserDetailId());
        boolean isLiked = c.getLovedBy() != null && c.getLovedBy().contains(currentUserId);

        Instant created = c.getCreatedAt() != null ? c.getCreatedAt().toInstant(DEFAULT_ZONE_OFFSET) : null;
        Instant updated = c.getUpdatedAt() != null ? c.getUpdatedAt().toInstant(DEFAULT_ZONE_OFFSET) : null;

        return CommentResponse.builder()
                .id(c.getId())
                .content(c.getContent())
                .replyCount(c.getReplyCount())
                .likeCount(c.getLoveCount())
                .dislikeCount(c.getDislikeCount())
                .userDetailId(c.getUserDetailId())
                .username(resolveUsername(owner))
                .avatarUrl(resolveAvatar(c, owner))
                .createdAt(created)
                .updatedAt(updated)
                .isLikedByCurrentUser(isLiked)
                .timeAgo(TimeFormatter.formatTimeAgo(created))
                .parentCommentId(c.getParentCommentId())
                .build();
    }

    private String resolveUsername(UserDetail u) {
        if (u == null) return "User";
        if (u.getDisplayName() != null && !u.getDisplayName().isBlank()) return u.getDisplayName();
        if (u.getShownName() != null && !u.getShownName().isBlank()) return u.getShownName();
        return "User";
    }

    private String resolveAvatar(Comment c, UserDetail u) {
        if (c.getAvatarUrl() != null) return c.getAvatarUrl();
        if (u != null && u.getAvatar() != null) return u.getAvatar().getUrl();
        return null;
    }
}
