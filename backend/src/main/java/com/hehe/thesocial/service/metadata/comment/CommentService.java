package com.hehe.thesocial.service.metadata.comment;

import com.hehe.thesocial.dto.request.comment.CommentCreateRequest;
import com.hehe.thesocial.dto.response.comment.CommentCreateResponse;
import com.hehe.thesocial.dto.response.comment.CommentResponse;
import com.hehe.thesocial.dto.response.metadata.CommentActionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentService {
    /**
     * Thêm comment mới cho một FeedItem
     * @param feedItemId - ID của FeedItem cần thêm comment
     * @param request - Thông tin comment (content, userDetailId, etc.)
     * @return CommentCreateResponse chứa comment vừa tạo và tổng số comments
     */
    CommentCreateResponse addComment(String feedItemId, CommentCreateRequest request);

    /**
     * Xóa comment khỏi FeedItem
     * @param commentId - ID của comment cần xóa
     * @param userDetailId - ID của user đang xóa comment (để check quyền)
     * @return true nếu xóa thành công
     */
    boolean removeComment(String commentId, String userDetailId);

    /**
     * Like một comment
     * @param commentId - ID của comment cần like
     * @param userDetailId - ID của user đang like
     * @return CommentActionResponse chứa trạng thái liked và số lượng like mới
     */
    CommentActionResponse likeComment(String commentId, String userDetailId);

    /**
     * Bỏ like một comment
     * @param commentId - ID của comment cần unlike
     * @param userDetailId - ID của user đang unlike
     * @return CommentActionResponse chứa trạng thái liked và số lượng like còn lại
     */
    CommentActionResponse unlikeComment(String commentId, String userDetailId);

    /**
     * Dislike một comment
     * @param commentId - ID của comment cần dislike
     * @param userDetailId - ID của user đang dislike
     * @return CommentActionResponse chứa trạng thái disliked và số lượng dislike mới
     */
    CommentActionResponse dislikeComment(String commentId, String userDetailId);

    /**
     * Bỏ dislike một comment
     * @param commentId - ID của comment cần undislike
     * @param userDetailId - ID của user đang undislike
     * @return CommentActionResponse chứa trạng thái disliked và số lượng dislike còn lại
     */
    CommentActionResponse undislikeComment(String commentId, String userDetailId);

    /**
     * Lấy thông tin chi tiết của một comment
     * @param commentId - ID của comment
     * @param currentUserDetailId - ID của user hiện tại (để check liked/disliked status)
     * @return CommentResponse
     */
    CommentResponse getComment(String commentId, String currentUserDetailId);

    /**
     * Lấy danh sách comments của một FeedItem
     * @param feedItemId - ID của FeedItem
     * @param currentUserDetailId - ID của user hiện tại
     * @param page - Trang hiện tại (bắt đầu từ 0)
     * @param size - Số lượng comment trên mỗi trang
     * @return Page<CommentResponse>
     */
    Page<CommentResponse> getCommentsByFeedItem(
            String feedItemId,
            String currentUserDetailId,
            Pageable pageable
    );
}
