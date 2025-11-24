package com.hehe.thesocial.service.feedItem;

import com.hehe.thesocial.dto.request.feedItem.FeedItemSearchRequest;
import com.hehe.thesocial.dto.request.feedItem.FeedItemUploadRequest;
import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.dto.response.feedItem.FeedItemUploadResponse;
import com.hehe.thesocial.dto.response.reportTicket.FeedItemReportSummaryResponse;
import com.hehe.thesocial.entity.enums.FeedItemType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface FeedItemService {
    FeedItemUploadResponse uploadFeedItem(FeedItemUploadRequest request);

    Page<FeedItemUploadResponse> getAllFeedItems(Pageable pageable);

    Page<FeedItemResponse> getFeedItemsByUserDetailId(String userDetailId, Pageable pageable);

    Page<FeedItemUploadResponse> getFeedItemsByType(FeedItemType feedItemType, Pageable pageable);

    FeedItemResponse getFeedItemById(String feedItemId);

    /**
     * Lấy danh sách feed item mà user đã love
     * @param userDetailId ID của user detail
     * @param pageable thông tin phân trang
     * @return Page chứa danh sách FeedItemResponse
     */
    Page<FeedItemResponse> getLovedFeedItems(String userDetailId, Pageable pageable);

    /**
     * Lấy tất cả các báo cáo của một feedItem
     * đồng thời trả về top 5 danh mục báo cáo theo số lượng
     * @param feedItemId ID của feedItem
     * @return thông tin tổng hợp các báo cáo
     */
    FeedItemReportSummaryResponse getReportsByFeedItemId(String feedItemId);

    /**
     * Vô hiệu hóa feedItem do vi phạm
     * @param feedItemId ID của feedItem cần vô hiệu hóa
     */
    void disableFeedItemByViolation(String feedItemId);

    /**
     * Get all violated feed items
     * @param pageable Pagination parameters
     * @return Page of violated feed items
     */
    Page<FeedItemUploadResponse> getViolatedFeedItems(Pageable pageable);

    /**
     * Search feed items using dynamic filters
     * @param request Search filters
     * @param pageable Pagination parameters
     * @return Page of feed items matching filters
     */
    Page<FeedItemUploadResponse> searchFeedItems(FeedItemSearchRequest request, Pageable pageable);
}

