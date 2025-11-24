package com.hehe.thesocial.service.search;

import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.HashTag;
import com.hehe.thesocial.entity.SearchHistory;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.entity.enums.InteractionType;
import com.hehe.thesocial.repository.FeedItemRepository;
import com.hehe.thesocial.repository.HashTagRepository;
import com.hehe.thesocial.repository.SearchHistoryRepository;
import com.hehe.thesocial.repository.UserInteractionRepository;
import com.hehe.thesocial.repository.UserPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.TextCriteria;
import org.springframework.data.mongodb.core.query.TextQuery;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final MongoTemplate mongoTemplate;
    private final HashTagRepository hashTagRepository;

    @Override
    public List<UserDetail> searchUsers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new ArrayList<>();
        }

        List<UserDetail> results = new ArrayList<>();

        // Try text search first (requires text index)
        try {
            TextCriteria criteria = TextCriteria.forDefaultLanguage().matching(keyword);
            Query query = TextQuery.queryText(criteria).sortByScore();
            results = mongoTemplate.find(query, UserDetail.class);

            // If text search returns results, return them
            if (!results.isEmpty()) {
                return results;
            }
        } catch (Exception e) {
            // Text index might not exist, fallback to regex search
            // Log in production: log.warn("Text index not found, using regex search", e);
        }

        // Fallback: Use regex search on displayName, shownName, and bio
        String regexPattern = ".*" + keyword + ".*";
        Query regexQuery = new Query(new Criteria().orOperator(
                Criteria.where("display_name").regex(regexPattern, "i"),
                Criteria.where("shown_name").regex(regexPattern, "i"),
                Criteria.where("bio").regex(regexPattern, "i")));

        results = mongoTemplate.find(regexQuery, UserDetail.class);
        return results;
    }

    @Override
    public List<FeedItem> searchFeedItems(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new ArrayList<>();
        }

        List<FeedItem> results = new ArrayList<>();

        // 1. Text Search (Title, Description) - requires text index
        try {
            TextCriteria textCriteria = TextCriteria.forDefaultLanguage().matchingAny(keyword);
            Query textQuery = TextQuery.queryText(textCriteria).sortByScore();
            List<FeedItem> textResults = mongoTemplate.find(textQuery, FeedItem.class);
            results.addAll(textResults);
        } catch (Exception e) {
            // Text index might not exist, will use regex fallback below
            // Log in production: log.warn("Text index not found, using regex search", e);
        }

        // 2. Fallback: Regex search on title and description if text search didn't work
        if (results.isEmpty()) {
            String regexPattern = ".*" + keyword + ".*";
            Query regexQuery = new Query(new Criteria().orOperator(
                    Criteria.where("title").regex(regexPattern, "i"),
                    Criteria.where("description").regex(regexPattern, "i")));
            results.addAll(mongoTemplate.find(regexQuery, FeedItem.class));
        }

        // 3. Hashtag Search
        List<HashTag> tags = hashTagRepository.findByNameContainingIgnoreCase(keyword);
        if (!tags.isEmpty()) {
            // Pass the entities themselves, Spring Data should convert to DBRef
            Query tagQuery = new Query(Criteria.where("hashtags_ref").in(tags));
            List<FeedItem> tagResults = mongoTemplate.find(tagQuery, FeedItem.class);
            results.addAll(tagResults);
        }

        // 4. Deduplicate
        return results.stream().distinct().collect(Collectors.toList());
    }

    private final SearchHistoryRepository searchHistoryRepository;
    private final com.hehe.thesocial.repository.UserPreferenceRepository userPreferenceRepository;
    private final UserInteractionRepository userInteractionRepository;
    private final FeedItemRepository feedItemRepository;

    @Override
    public void saveSearchHistory(String userDetailId, String query) {
        if (userDetailId == null || query == null || query.trim().isEmpty())
            return;

        SearchHistory history = SearchHistory.builder()
                .userDetailId(userDetailId)
                .query(query.trim())
                .createdAt(java.time.LocalDateTime.now())
                .build();
        searchHistoryRepository.save(history);
    }

    @Override
    public List<String> getSearchHistory(String userDetailId) {
        return searchHistoryRepository.findByUserDetailIdOrderByCreatedAtDesc(userDetailId)
                .stream()
                .map(SearchHistory::getQuery)
                .distinct()
                .limit(10)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteSearchHistory(String userDetailId) {
        searchHistoryRepository.deleteByUserDetailId(userDetailId);
    }

    @Override
    public void deleteSearchHistoryItem(String userDetailId, String query) {
        searchHistoryRepository.deleteByUserDetailIdAndQuery(userDetailId, query);
    }

    @Override
    public List<FeedItem> getSuggestions(String userDetailId) {
        // 1. Get watched items from UserPreference
        java.util.Set<String> excludedIds = new java.util.HashSet<>();
        if (userDetailId != null) {
            // Watched list
            com.hehe.thesocial.entity.UserPreference userPreference = userPreferenceRepository
                    .findByUserDetailId(userDetailId)
                    .orElse(null);
            if (userPreference != null && userPreference.getWatchedList() != null) {
                excludedIds.addAll(userPreference.getWatchedList());
            }
            // Liked items (interactions of type LIKE)
            List<com.hehe.thesocial.entity.UserInteraction> likedInteractions = userInteractionRepository
                    .findByUserDetailIdAndInteractionTypeIn(userDetailId,
                            java.util.List.of(com.hehe.thesocial.entity.enums.InteractionType.LIKE));
            if (likedInteractions != null) {
                excludedIds.addAll(likedInteractions.stream()
                        .map(com.hehe.thesocial.entity.UserInteraction::getFeedItemId)
                        .collect(java.util.stream.Collectors.toSet()));
            }
        }

        // 2. Get newest unwatched/unliked items
        org.springframework.data.domain.PageRequest pageRequest = org.springframework.data.domain.PageRequest.of(0, 10,
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,
                        "createdAt"));

        if (excludedIds.isEmpty()) {
            return feedItemRepository.findAll(pageRequest).getContent();
        } else {
            return feedItemRepository.findByIdNotIn(excludedIds, pageRequest);
        }
    }
}
