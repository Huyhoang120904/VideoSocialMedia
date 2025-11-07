package com.hehe.thesocial.service.feed;

import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FeedService {
    Page<FeedItemResponse> getAllFeedItems(Pageable pageable);
}

