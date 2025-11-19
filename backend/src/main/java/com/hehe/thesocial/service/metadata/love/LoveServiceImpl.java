package com.hehe.thesocial.service.metadata.love;

import com.hehe.thesocial.dto.response.metadata.LoveResponse;
import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.MetaData;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.repository.FeedItemRepository;
import com.hehe.thesocial.repository.MetaDataRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)

public class LoveServiceImpl implements LoveService {

    FeedItemRepository feedItemRepository;
    MetaDataRepository metaDataRepository;

    /**
     * Thêm love (tim/thích) cho một FeedItem
     * @param feedItemId - ID của FeedItem cần thêm love
     * @param userDetailId - ID của user đang thêm love
     * @return LoveResponse chứa trạng thái loved và số lượng love mới
     */
    @Override
    public LoveResponse addLove(String feedItemId, String userDetailId) {
        FeedItem feedItem = feedItemRepository.findById(feedItemId)
                .orElseThrow(() -> new AppException(ErrorCode.FEED_ITEM_NOT_FOUND));

        // Kiểm tra đã love chưa
        Set<String> lovedBy = feedItem.getLovedBy() != null ? feedItem.getLovedBy() : new HashSet<>();
        if (lovedBy.contains(userDetailId)) {
            return LoveResponse.builder()
                    .loved(true)
                    .loveCount(feedItem.getMetaData() != null ? feedItem.getMetaData().getLoveCount() : 0L)
                    .build();
        }

        // Thêm user vào lovedBy
        lovedBy.add(userDetailId);
        feedItem.setLovedBy(lovedBy);
        feedItemRepository.save(feedItem);

        // Tăng loveCount trong metadata
        long newLoveCount = 1L;
        if (feedItem.getMetaData() != null) {
            MetaData metadata = feedItem.getMetaData();
            newLoveCount = metadata.getLoveCount() + 1;
            metadata.setLoveCount(newLoveCount);
            metaDataRepository.save(metadata);
        }

        return LoveResponse.builder()
                .loved(true)
                .loveCount(newLoveCount)
                .build();
    }

    /**
     * Xóa love (bỏ thích) cho một FeedItem
     * @param feedItemId - ID của FeedItem cần xóa love
     * @param userDetailId - ID của user đang xóa love
     * @return LoveResponse chứa trạng thái loved=false và số lượng love còn lại
     */
    @Override
    public LoveResponse removeLove(String feedItemId, String userDetailId) {
        FeedItem feedItem = feedItemRepository.findById(feedItemId)
                .orElseThrow(() -> new AppException(ErrorCode.FEED_ITEM_NOT_FOUND));

        // Kiểm tra user có love chưa
        Set<String> lovedBy = feedItem.getLovedBy();
        if (lovedBy == null || !lovedBy.contains(userDetailId)) {
            return LoveResponse.builder()
                    .loved(false)
                    .loveCount(feedItem.getMetaData() != null ? feedItem.getMetaData().getLoveCount() : 0L)
                    .build();
        }

        // Xóa user khỏi lovedBy
        lovedBy.remove(userDetailId);
        feedItem.setLovedBy(lovedBy);
        feedItemRepository.save(feedItem);

        // Giảm loveCount trong metadata
        long newLoveCount = 0L;
        if (feedItem.getMetaData() != null) {
            MetaData metadata = feedItem.getMetaData();
            newLoveCount = Math.max(0, metadata.getLoveCount() - 1);
            metadata.setLoveCount(newLoveCount);
            metaDataRepository.save(metadata);
        }

        return LoveResponse.builder()
                .loved(false)
                .loveCount(newLoveCount)
                .build();
    }

    /**
     * Kiểm tra trạng thái love của user đối với một FeedItem
     * @param feedItemId - ID của FeedItem cần kiểm tra
     * @param userDetailId - ID của user cần kiểm tra
     * @return LoveResponse chứa:
     *         - loved: true nếu user đã love, false nếu chưa
     *         - loveCount: tổng số love của FeedItem này
     */
    @Override
    public LoveResponse checkLoveStatus(String feedItemId, String userDetailId) {
        FeedItem feedItem = feedItemRepository.findById(feedItemId)
                .orElseThrow(() -> new AppException(ErrorCode.FEED_ITEM_NOT_FOUND));

        boolean isLoved = feedItem.getLovedBy() != null && feedItem.getLovedBy().contains(userDetailId);
        long loveCount = feedItem.getMetaData() != null ? feedItem.getMetaData().getLoveCount() : 0L;

        return LoveResponse.builder()
                .loved(isLoved)
                .loveCount(loveCount)
                .build();
    }
}
