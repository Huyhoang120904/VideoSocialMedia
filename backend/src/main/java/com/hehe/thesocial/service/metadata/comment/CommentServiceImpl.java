package com.hehe.thesocial.service.metadata.comment;

import com.hehe.thesocial.dto.request.comment.CommentCreateRequest;
import com.hehe.thesocial.dto.response.comment.CommentCreateResponse;
import com.hehe.thesocial.dto.response.comment.CommentResponse;
import com.hehe.thesocial.dto.response.metadata.CommentActionResponse;
import com.hehe.thesocial.entity.*;
import com.hehe.thesocial.entity.enums.InteractionType;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.repository.*;
import com.hehe.thesocial.util.TimeFormatter;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentServiceImpl implements CommentService {

    CommentRepository commentRepository;
    FeedItemRepository feedItemRepository;
    MetaDataRepository metaDataRepository;
    UserDetailRepository userDetailRepository;
    UserInteractionRepository userInteractionRepository;


    @Override
    public CommentCreateResponse addComment(String feedItemId, CommentCreateRequest request) {
        FeedItem feedItem = feedItemRepository.findById(feedItemId)
                .orElseThrow(() -> new AppException(ErrorCode.FEED_ITEM_NOT_FOUND));

        // Lấy thông tin user để lấy avatarUrl
        UserDetail userDetail = userDetailRepository.findById(request.getUserDetailId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Lấy avatar URL (nếu có)
        String avatarUrl = userDetail.getAvatar() != null ? userDetail.getAvatar().getUrl() : null;

        // Tạo comment mới và lưu vào bảng Comment
        Comment comment = Comment.builder()
                .content(request.getContent())
                .userDetailId(request.getUserDetailId())
                .avatarUrl(avatarUrl) // Lấy avatar từ UserDetail
                .feedItemId(feedItemId)
                .loveCount(0L)
                .dislikeCount(0L)
                .replyCount(0)
                .lovedBy(new HashSet<>())
                .dislikedBy(new HashSet<>())
                .build();

        comment = commentRepository.save(comment);
        userInteractionRepository.save(UserInteraction.builder()
                .interactionType(InteractionType.COMMENT)
                .feedItemId(feedItemId)
                .userDetailId(request.getUserDetailId())
                .build());

        // Tăng commentCount trong metadata và lấy số lượng mới
        long totalComments = 0;
        if (feedItem.getMetaData() != null) {
            MetaData metadata = feedItem.getMetaData();
            metadata.setCommentsCount(metadata.getCommentsCount() + 1);
            metaDataRepository.save(metadata);
            totalComments = metadata.getCommentsCount();
        }

        log.info("Added new comment with id {} to feed item {}", comment.getId(), feedItemId);

        return CommentCreateResponse.builder()
                .comment(mapToCommentResponse(comment, request.getUserDetailId()))
                .totalComments(totalComments)
                .build();
    }

    @Override
    public boolean removeComment(String commentId, String userDetailId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        // Kiểm tra quyền xóa (chỉ người tạo mới được xóa)
        if (!comment.getUserDetailId().equals(userDetailId)) {
            throw new AppException(ErrorCode.UNCATEGORIZED);
        }

        // Giảm commentCount trong metadata
        FeedItem feedItem = feedItemRepository.findById(comment.getFeedItemId())
                .orElseThrow(() -> new AppException(ErrorCode.FEED_ITEM_NOT_FOUND));

        if (feedItem.getMetaData() != null) {
            MetaData metadata = feedItem.getMetaData();
            metadata.setCommentsCount(Math.max(0, metadata.getCommentsCount() - 1));
            metaDataRepository.save(metadata);
        }

        // Xóa comment khỏi bảng Comment
        commentRepository.delete(comment);
        return true;
    }

    @Override
    public CommentActionResponse likeComment(String commentId, String userDetailId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        Set<String> lovedBy = comment.getLovedBy() != null ? comment.getLovedBy() : new HashSet<>();
        Set<String> dislikedBy = comment.getDislikedBy() != null ? comment.getDislikedBy() : new HashSet<>();

        // Nếu đã like rồi, return trạng thái hiện tại
        if (lovedBy.contains(userDetailId)) {
            return CommentActionResponse.builder()
                    .liked(true)
                    .disliked(false)
                    .likeCount(comment.getLoveCount())
                    .dislikeCount(comment.getDislikeCount())
                    .build();
        }

        // Nếu đang dislike thì bỏ dislike trước
        if (dislikedBy.contains(userDetailId)) {
            dislikedBy.remove(userDetailId);
            comment.setDislikeCount(Math.max(0, comment.getDislikeCount() - 1));
        }

        // Thêm like
        lovedBy.add(userDetailId);
        comment.setLovedBy(lovedBy);
        comment.setDislikedBy(dislikedBy);
        comment.setLoveCount(comment.getLoveCount() + 1);
        commentRepository.save(comment);

        userInteractionRepository.save(UserInteraction.builder()
                .interactionType(InteractionType.COMMENT)
                .feedItemId(comment.getFeedItemId())
                .userDetailId(comment.getUserDetailId())
                .build());

        return CommentActionResponse.builder()
                .liked(true)
                .disliked(false)
                .likeCount(comment.getLoveCount())
                .dislikeCount(comment.getDislikeCount())
                .build();
    }

    @Override
    public CommentActionResponse unlikeComment(String commentId, String userDetailId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        Set<String> lovedBy = comment.getLovedBy();

        // Nếu chưa like thì return trạng thái hiện tại
        if (lovedBy == null || !lovedBy.contains(userDetailId)) {
            return CommentActionResponse.builder()
                    .liked(false)
                    .disliked(comment.getDislikedBy() != null && comment.getDislikedBy().contains(userDetailId))
                    .likeCount(comment.getLoveCount())
                    .dislikeCount(comment.getDislikeCount())
                    .build();
        }

        // Xóa like
        lovedBy.remove(userDetailId);
        comment.setLovedBy(lovedBy);
        comment.setLoveCount(Math.max(0, comment.getLoveCount() - 1));
        commentRepository.save(comment);

        return CommentActionResponse.builder()
                .liked(false)
                .disliked(comment.getDislikedBy() != null && comment.getDislikedBy().contains(userDetailId))
                .likeCount(comment.getLoveCount())
                .dislikeCount(comment.getDislikeCount())
                .build();
    }

    @Override
    public CommentActionResponse dislikeComment(String commentId, String userDetailId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        Set<String> lovedBy = comment.getLovedBy() != null ? comment.getLovedBy() : new HashSet<>();
        Set<String> dislikedBy = comment.getDislikedBy() != null ? comment.getDislikedBy() : new HashSet<>();

        // Nếu đã dislike rồi, return trạng thái hiện tại
        if (dislikedBy.contains(userDetailId)) {
            return CommentActionResponse.builder()
                    .liked(false)
                    .disliked(true)
                    .likeCount(comment.getLoveCount())
                    .dislikeCount(comment.getDislikeCount())
                    .build();
        }

        // Nếu đang like thì bỏ like trước
        if (lovedBy.contains(userDetailId)) {
            lovedBy.remove(userDetailId);
            comment.setLoveCount(Math.max(0, comment.getLoveCount() - 1));
        }

        // Thêm dislike
        dislikedBy.add(userDetailId);
        comment.setLovedBy(lovedBy);
        comment.setDislikedBy(dislikedBy);
        comment.setDislikeCount(comment.getDislikeCount() + 1);
        commentRepository.save(comment);

        return CommentActionResponse.builder()
                .liked(false)
                .disliked(true)
                .likeCount(comment.getLoveCount())
                .dislikeCount(comment.getDislikeCount())
                .build();
    }

    @Override
    public CommentActionResponse undislikeComment(String commentId, String userDetailId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        Set<String> dislikedBy = comment.getDislikedBy();

        // Nếu chưa dislike thì return trạng thái hiện tại
        if (dislikedBy == null || !dislikedBy.contains(userDetailId)) {
            return CommentActionResponse.builder()
                    .liked(comment.getLovedBy() != null && comment.getLovedBy().contains(userDetailId))
                    .disliked(false)
                    .likeCount(comment.getLoveCount())
                    .dislikeCount(comment.getDislikeCount())
                    .build();
        }

        // Xóa dislike
        dislikedBy.remove(userDetailId);
        comment.setDislikedBy(dislikedBy);
        comment.setDislikeCount(Math.max(0, comment.getDislikeCount() - 1));
        commentRepository.save(comment);

        return CommentActionResponse.builder()
                .liked(comment.getLovedBy() != null && comment.getLovedBy().contains(userDetailId))
                .disliked(false)
                .likeCount(comment.getLoveCount())
                .dislikeCount(comment.getDislikeCount())
                .build();
    }

    @Override
    public CommentResponse getComment(String commentId, String currentUserDetailId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        return mapToCommentResponse(comment, currentUserDetailId);
    }

    @Override
    public Page<CommentResponse> getCommentsByFeedItem(
            String feedItemId,
            String currentUserDetailId,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> commentsPage = commentRepository.findByFeedItemIdOrderByCreatedAtDesc(feedItemId, pageable);

        return commentsPage.map(comment -> mapToCommentResponse(comment, currentUserDetailId));
    }

    /**
     * Helper method để map Comment entity sang CommentResponse DTO
     */
    private CommentResponse mapToCommentResponse(Comment comment, String currentUserDetailId) {
        boolean isLiked = comment.getLovedBy() != null && comment.getLovedBy().contains(currentUserDetailId);

        // Lấy username từ UserDetail
        String username = "User";
        if (comment.getUserDetailId() != null) {
            UserDetail userDetail = userDetailRepository.findById(comment.getUserDetailId()).orElse(null);
            if (userDetail != null) {
                // Ưu tiên displayName, fallback sang shownName
                username = userDetail.getDisplayName() != null && !userDetail.getDisplayName().isEmpty()
                        ? userDetail.getDisplayName()
                        : (userDetail.getShownName() != null ? userDetail.getShownName() : "User");
            }
        }

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .likeCount(comment.getLoveCount())
                .dislikeCount(comment.getDislikeCount())
                .replyCount(comment.getReplyCount())
                .userDetailId(comment.getUserDetailId())
                .username(username)
                .avatarUrl(comment.getAvatarUrl())
                .createdAt(comment.getCreatedAt() != null ? comment.getCreatedAt().toInstant(ZoneOffset.of("+07:00")) : null)
                .updatedAt(comment.getUpdatedAt() != null ? comment.getUpdatedAt().toInstant(ZoneOffset.of("+07:00")) : null)
                .isLikedByCurrentUser(isLiked)
                .timeAgo(TimeFormatter.formatTimeAgo(
                        comment.getCreatedAt() != null ? comment.getCreatedAt().toInstant(ZoneOffset.of("+07:00")) : null))
                .build();
    }
}
