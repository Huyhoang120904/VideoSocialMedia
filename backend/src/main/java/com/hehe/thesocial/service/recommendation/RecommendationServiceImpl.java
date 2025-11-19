package com.hehe.thesocial.service.recommendation;

import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.dto.response.feedItem.FeedItemListResponse;
import com.hehe.thesocial.entity.*;
import com.hehe.thesocial.entity.enums.InteractionType;
import com.hehe.thesocial.mapper.feedItem.FeedItemMapper;
import com.hehe.thesocial.repository.FeedItemRepository;
import com.hehe.thesocial.repository.UserInteractionRepository;
import com.hehe.thesocial.repository.UserPreferenceRepository;
import com.hehe.thesocial.util.AuthenticationHelper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class RecommendationServiceImpl {

    FeedItemRepository feedItemRepository;
    AuthenticationHelper authenticationHelper;
    UserPreferenceRepository userPreferenceRepository;
    UserInteractionRepository userInteractionRepository;
    FeedItemMapper feedItemMapper;

    public static int PREFERENCE_CUT = 7;
    static Double TRENDING_DECAY_HOURS = 48D;
    static Double PREFERENCE_WEIGHT = 0.4;
    static Double COLLABORATIVE_WEIGHT = 0.3;
    static Double TRENDING_WEIGHT = 0.3;
    static Double RANDOM_WEIGHT = 0.1;

    public Page<FeedItemResponse> personalRecommendation(Pageable pageable) {
        UserDetail userDetail = authenticationHelper.getCurrentUserDetail();
        log.info("Generating recommended feed for user: {}", userDetail.getId());

        UserPreference userPreference = userPreferenceRepository.findByUserDetailId(userDetail.getId())
                .orElse(null);

        Set<String> watchedList = userPreference != null && userPreference.getWatchedList() != null
                ? userPreference.getWatchedList()
                : new HashSet<>();

        List<ScoredFeedItem> scoredItems = new ArrayList<>();

        //User Preference-Based Recommendations
        scoredItems.addAll(getPreferenceRecommendations(
                userPreference, watchedList
        ));

        //Collaborative Recommendations
        scoredItems.addAll(getCollaborativeRecommendations(
                watchedList, pageable, userDetail.getId()
        ));


        //Trending Recommendations
        scoredItems.addAll(getTrendingRecommendations(
                watchedList, pageable
        ));

        //Random Recommendations
        scoredItems.addAll(getRandomRecommendations(
                watchedList, pageable
        ));

        // Combine and sort by score
        List<FeedItemResponse> recommendations = scoredItems.stream()
                .collect(Collectors.groupingBy(
                        ScoredFeedItem::getFeedItem,
                        Collectors.summingDouble(ScoredFeedItem::getScore)
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<FeedItem, Double>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .distinct()
                .skip(pageable.getOffset())
                .limit(pageable.getPageSize())
                .map(feedItemMapper::toFeedItemResponse)
                .collect(Collectors.toList());

        log.info("Generated {} recommendations for user: {}", recommendations.size(), userDetail.getId());

        return new PageImpl<>(recommendations, pageable, recommendations.size());
    }

    private List<ScoredFeedItem> getPreferenceRecommendations(UserPreference userPreference, Set<String> watchedList) {
        if (userPreference == null || userPreference.getHashtagScores().isEmpty()) {
            return Collections.emptyList();
        }

        //Top 15 hashTags for user
        Set<String> hashTags = userPreference.getHashtagScores().entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(10)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());

        List<FeedItem> feedItems = feedItemRepository.findAllByHashTags_NameInAndIdNotIn(
                hashTags, watchedList
        );

        return feedItems.stream()
                .map(i -> {
                    double score = calculatePreferenceScore(i, userPreference);
                    return new ScoredFeedItem(i, score * PREFERENCE_WEIGHT);
                })
                .toList();
    }

    private double calculatePreferenceScore(FeedItem feedItem, UserPreference userPreference) {
        double score = 0;

        //Hash Tag Scoring
        if (feedItem.getHashTags() != null) {
            for (HashTag hashTag : feedItem.getHashTags()) {
                Double hashTagScore = userPreference.getHashtagScores().get(hashTag.getName());
                score += hashTagScore;
            }
        }

        //Creator Scoring
        UserDetail userDetail = feedItem.getUploader();
        Double creatorScore = userPreference.getCreatorScores().get(userDetail.getId());
        score += 1.5 * creatorScore;

        // Normalize by engagement
        double engagementScore = (feedItem.getMetaData().getLoveCount() +
                feedItem.getMetaData().getCommentsCount() * 2 +
                feedItem.getMetaData().getSharesCount() * 3) / 100.0;

        score += Math.log1p(engagementScore);

        return score;
    }


    private List<ScoredFeedItem> getCollaborativeRecommendations(Set<String> watchedList, Pageable pageable, String userDetailId) {

        LocalDateTime latestInteractionCut = LocalDateTime.now().minusDays(PREFERENCE_CUT);

        //Get user interaction from the latest interaction cut
        Set<UserInteraction> userInteractions = userInteractionRepository
                .findByUserDetailIdAndCreatedAtAfter(userDetailId, latestInteractionCut);

        Set<String> lovedItems = userInteractions.stream()
                .filter(i -> i.getInteractionType().equals(InteractionType.LIKE))
                .map(UserInteraction::getFeedItemId)
                .collect(Collectors.toSet());

        if (lovedItems.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, Long> similarUsers = new HashMap<>();

        for (String itemId : lovedItems) {
            List<UserInteraction> interactions = userInteractionRepository.findByFeedItemIdAndInteractionTypeIn(
                    itemId, List.of(InteractionType.LIKE, InteractionType.COMMENT)
            );

            interactions.stream()
                    .filter(i -> !i.getUserDetailId().equals(userDetailId))
                    .forEach(i -> similarUsers.merge(i.getUserDetailId(), 1L, Long::sum));
        }

        // Get items liked by similar users
        List<FeedItem> recommendations = new ArrayList<>();
        for (String similarUserId : similarUsers.keySet()) {
            List<UserInteraction> theirLikes = userInteractionRepository
                    .findByUserDetailIdAndInteractionTypeIn(
                            similarUserId,
                            List.of(InteractionType.LIKE, InteractionType.COMMENT),
                            PageRequest.of(0, 20)
                    );

            theirLikes.stream()
                    .map(UserInteraction::getFeedItemId)
                    .filter(id -> !watchedList.contains(id) && !lovedItems.contains(id))
                    .forEach(id -> feedItemRepository.findById(id)
                            .ifPresent(recommendations::add));
        }

        return recommendations.stream()
                .distinct()
                .limit(pageable.getPageSize())
                .map(item -> new ScoredFeedItem(item, COLLABORATIVE_WEIGHT))
                .toList();
    }

    private List<ScoredFeedItem> getTrendingRecommendations(Set<String> watchedList, Pageable pageable) {
        List<FeedItem> allItems = feedItemRepository.findByIdNotIn(
                watchedList,
                PageRequest.of(0, pageable.getPageSize() * 3)
        );

        return allItems.stream()
                .map(item -> {
                    double trendingScore = calculateTrendingScore(item);
                    return new ScoredFeedItem(item, trendingScore * TRENDING_WEIGHT);
                })
                .sorted(Comparator.comparingDouble(ScoredFeedItem::getScore).reversed())
                .limit(pageable.getPageSize())
                .collect(Collectors.toList());
    }

    private double calculateTrendingScore(FeedItem feedItem) {

        LocalDateTime createdAt = feedItem.getCreatedAt();
        if (createdAt == null) {
            return 0.0;
        }

        double hoursSinceCreation = java.time.Duration.between(
                createdAt,
                LocalDateTime.now()
        ).toHours();

        // Time decay factor
        double timeDecay = Math.exp(-hoursSinceCreation / TRENDING_DECAY_HOURS);

        // Engagement velocity (engagement per hour)
        double engagement = feedItem.getMetaData().getLoveCount() +
                feedItem.getMetaData().getCommentsCount() * 2 +
                feedItem.getMetaData().getSharesCount() * 3;
        double velocity = engagement / Math.max(hoursSinceCreation, 1.0);

        return velocity * timeDecay;
    }

    private List<ScoredFeedItem> getRandomRecommendations(Set<String> watchedList, Pageable pageable) {
        List<FeedItem> randomItems = feedItemRepository.findByIdNotIn(
                watchedList,
                PageRequest.of(0, pageable.getPageSize())
        );

        return randomItems.stream()
                .map(item -> new ScoredFeedItem(item, RANDOM_WEIGHT))
                .toList();
    }

    @lombok.Value
    public static class ScoredFeedItem {
        FeedItem feedItem;
        double score;
    }


}
