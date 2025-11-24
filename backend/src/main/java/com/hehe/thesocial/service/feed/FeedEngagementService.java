package com.hehe.thesocial.service.feed;

import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.MetaData;
import com.hehe.thesocial.entity.UserPreference;

public interface FeedEngagementService {

    MetaData ensureMetaData(FeedItem feedItem);

    long updateCommentCount(FeedItem feedItem, int delta);

    long incrementLoveCount(FeedItem feedItem);

    long decrementLoveCount(FeedItem feedItem);

    long incrementViewCountIfNeeded(FeedItem feedItem, String userDetailId);

    void addLikedFeedItem(String userDetailId, String feedItemId);

    void removeLikedFeedItem(String userDetailId, String feedItemId);

    UserPreference getOrCreatePreference(String userDetailId);
}

