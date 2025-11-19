package com.hehe.thesocial.service.feedItem;

import com.hehe.thesocial.dto.request.feedItem.FeedItemUploadRequest;
import com.hehe.thesocial.dto.response.feedItem.FeedItemUploadResponse;
import com.hehe.thesocial.entity.enums.FeedItemType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FeedItemService {
    FeedItemUploadResponse uploadFeedItem(FeedItemUploadRequest request);

    Page<FeedItemUploadResponse> getAllFeedItems(Pageable pageable);

    Page<FeedItemUploadResponse> getFeedItemsByUserDetailId(String userDetailId, Pageable pageable);

    Page<FeedItemUploadResponse> getFeedItemsByType(FeedItemType feedItemType, Pageable pageable);
}

