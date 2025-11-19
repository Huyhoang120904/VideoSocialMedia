package com.hehe.thesocial.service.userPreference;

import com.hehe.thesocial.entity.HashTag;
import com.hehe.thesocial.entity.UserInteraction;
import com.hehe.thesocial.entity.UserPreference;
import com.hehe.thesocial.repository.FeedItemRepository;
import com.hehe.thesocial.repository.UserInteractionRepository;
import com.hehe.thesocial.repository.UserPreferenceRepository;
import com.hehe.thesocial.service.recommendation.RecommendationServiceImpl;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class UserPreferenceServiceImpl implements UserPreferenceService {
    UserPreferenceRepository userPreferenceRepository;
    UserInteractionRepository userInteractionRepository;
    FeedItemRepository feedItemRepository;

    @Transactional
    @Override
    public void updateUserPreferences(String userDetailId) {
        UserPreference preference = userPreferenceRepository
                .findByUserDetailId(userDetailId)
                .orElse(UserPreference.builder()
                        .userDetailId(userDetailId)
                        .hashtagScores(new HashMap<>())
                        .creatorScores(new HashMap<>())
                        .watchedList(new HashSet<>())
                        .build());

        Set<UserInteraction> recentInteractions = userInteractionRepository
                .findByUserDetailIdAndCreatedAtAfter(
                        userDetailId,
                        LocalDateTime.now().minusDays(RecommendationServiceImpl.PREFERENCE_CUT)
                );

        Map<String, Double> hashtagScores = new HashMap<>();
        Map<String, Double> creatorScores = new HashMap<>();
        Set<String> seenItems = new HashSet<>();
        List<Double> watchDurations = new ArrayList<>();

        for (UserInteraction interaction : recentInteractions) {
            seenItems.add(interaction.getFeedItemId());

            if (interaction.getWatchDuration() != null) {
                watchDurations.add(interaction.getWatchDuration());
            }

            feedItemRepository.findById(interaction.getFeedItemId())
                    .ifPresent(feedItem -> {
                        // Update hashtag scores
                        if (feedItem.getHashTags() != null) {
                            for (HashTag hashtag : feedItem.getHashTags()) {
                                hashtagScores.merge(
                                        hashtag.getId(),
                                        (double) interaction.getInteractionType().getWeight(),
                                        Double::sum
                                );
                            }
                        }

                        // Update creator scores
                        String creatorId = feedItem.getUploader().getId();
                        if (creatorId != null) {
                            creatorScores.merge(
                                    creatorId,
                                    (double) interaction.getInteractionType().getWeight(),
                                    Double::sum
                            );
                        }
                    });
        }

        // Calculate preferred video duration
        if (!watchDurations.isEmpty()) {
            preference.setPreferredVideoDuration(
                    watchDurations.stream()
                            .mapToDouble(Double::doubleValue)
                            .average()
                            .orElse(0.0)
            );
        }

        preference.setHashtagScores(hashtagScores);
        preference.setCreatorScores(creatorScores);
        preference.setLastSeenFeedItems(seenItems);
        preference.setUpdatedAt(LocalDateTime.now());

        userPreferenceRepository.save(preference);
        log.info("Updated preferences for user detail: {}", userDetailId);
    }

}
