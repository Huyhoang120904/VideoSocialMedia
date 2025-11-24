package com.hehe.thesocial.service.search;

import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.UserDetail;

import java.util.List;

public interface SearchService {
    List<UserDetail> searchUsers(String keyword);

    List<FeedItem> searchFeedItems(String keyword);

    void saveSearchHistory(String userDetailId, String query);

    List<String> getSearchHistory(String userDetailId);

    void deleteSearchHistory(String userDetailId);

    void deleteSearchHistoryItem(String userDetailId, String query);

    List<FeedItem> getSuggestions(String userDetailId);
}
