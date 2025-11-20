package com.hehe.thesocial.service.feed;

import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.dto.response.feedItem.FeedItemListResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FeedService {
    Page<FeedItemResponse> getAllFeedItems(Pageable pageable);
    Page<FeedItemResponse> getPersonalizedFeed(Pageable pageable);
    Page<FeedItemResponse> getExploreFeed(Pageable pageable);
    Page<FeedItemResponse> getFollowingFeed(Pageable pageable);
}

