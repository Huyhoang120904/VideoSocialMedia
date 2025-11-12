package com.hehe.thesocial.service.metadata.love;

import com.hehe.thesocial.dto.response.metadata.LoveResponse;

public interface LoveService {
    /**
     * Thêm userDetailId vào danh sách lovedBy của feedItem
     * Tăng loveCount trong metadata
     * @param feedItemId ID của feed item
     * @param userDetailId ID của user detail
     * @return LoveResponse chứa trạng thái loved và loveCount mới
     */
    LoveResponse addLove(String feedItemId, String userDetailId);

    /**
     * Xóa userDetailId khỏi danh sách lovedBy của feedItem
     * Giảm loveCount trong metadata
     * @param feedItemId ID của feed item
     * @param userDetailId ID của user detail
     * @return LoveResponse chứa trạng thái loved và loveCount mới
     */
    LoveResponse removeLove(String feedItemId, String userDetailId);

    /**
     * Kiểm tra xem userDetail đã love feedItem chưa
     * @param feedItemId ID của feed item
     * @param userDetailId ID của user detail
     * @return LoveResponse chứa trạng thái loved và loveCount hiện tại
     */
    LoveResponse checkLoveStatus(String feedItemId, String userDetailId);
}
