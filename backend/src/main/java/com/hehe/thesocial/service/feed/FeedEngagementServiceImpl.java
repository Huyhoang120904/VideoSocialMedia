package com.hehe.thesocial.service.feed;

import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.MetaData;
import com.hehe.thesocial.entity.UserPreference;
import com.hehe.thesocial.repository.FeedItemRepository;
import com.hehe.thesocial.repository.MetaDataRepository;
import com.hehe.thesocial.repository.UserPreferenceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FeedEngagementServiceImpl implements FeedEngagementService {

    MetaDataRepository metaDataRepository;
    FeedItemRepository feedItemRepository;
    UserPreferenceRepository userPreferenceRepository;

    @Override
    @Transactional
    public MetaData ensureMetaData(FeedItem feedItem) {
        MetaData metaData = feedItem.getMetaData();
        if (metaData != null) {
            return metaData;
        }

        metaData = MetaData.builder()
                .loveCount(0L)
                .commentsCount(0L)
                .viewsCount(0L)
                .sharesCount(0L)
                .build();
        metaData = metaDataRepository.save(metaData);

        feedItem.setMetaData(metaData);
        feedItemRepository.save(feedItem);
        log.debug("Created metadata for feed item {}", feedItem.getId());
        return metaData;
    }

    @Override
    @Transactional
    public long updateCommentCount(FeedItem feedItem, int delta) {
        MetaData metaData = ensureMetaData(feedItem);
        long updated = adjustCounter(metaData.getCommentsCount(), delta);
        metaData.setCommentsCount(updated);
        metaDataRepository.save(metaData);
        log.debug("Updated comment count for feed item {} to {}", feedItem.getId(), updated);
        return updated;
    }

    @Override
    @Transactional
    public long incrementLoveCount(FeedItem feedItem) {
        MetaData metaData = ensureMetaData(feedItem);
        long updated = adjustCounter(metaData.getLoveCount(), 1);
        metaData.setLoveCount(updated);
        metaDataRepository.save(metaData);
        log.debug("Incremented love count for feed item {} to {}", feedItem.getId(), updated);
        return updated;
    }

    @Override
    @Transactional
    public long decrementLoveCount(FeedItem feedItem) {
        MetaData metaData = ensureMetaData(feedItem);
        long updated = adjustCounter(metaData.getLoveCount(), -1);
        metaData.setLoveCount(updated);
        metaDataRepository.save(metaData);
        log.debug("Decremented love count for feed item {} to {}", feedItem.getId(), updated);
        return updated;
    }

    @Override
    @Transactional
    public long incrementViewCountIfNeeded(FeedItem feedItem, String userDetailId) {
        MetaData metaData = ensureMetaData(feedItem);
        UserPreference preference = getOrCreatePreference(userDetailId);

        Set<String> watchedList = ensureMutable(preference.getWatchedList());
        if (!watchedList.add(feedItem.getId())) {
            long current = safeValue(metaData.getViewsCount());
            log.debug("User {} already watched feed item {}. Views remain {}", userDetailId, feedItem.getId(), current);
            return current;
        }

        long updated = adjustCounter(metaData.getViewsCount(), 1);
        metaData.setViewsCount(updated);
        metaDataRepository.save(metaData);

        preference.setWatchedList(watchedList);
        userPreferenceRepository.save(preference);
        log.debug("Incremented view count for feed item {} to {}", feedItem.getId(), updated);
        return updated;
    }

    @Override
    @Transactional
    public void addLikedFeedItem(String userDetailId, String feedItemId) {
        UserPreference preference = getOrCreatePreference(userDetailId);
        Set<String> likedVideos = ensureMutable(preference.getLikedVideos());
        boolean added = likedVideos.add(feedItemId);
        if (added) {
            preference.setLikedVideos(likedVideos);
            userPreferenceRepository.save(preference);
            log.debug("Added feed item {} to liked videos for user {}", feedItemId, userDetailId);
        }
    }

    @Override
    @Transactional
    public void removeLikedFeedItem(String userDetailId, String feedItemId) {
        UserPreference preference = getOrCreatePreference(userDetailId);
        Set<String> likedVideos = ensureMutable(preference.getLikedVideos());
        if (likedVideos.remove(feedItemId)) {
            preference.setLikedVideos(likedVideos);
            userPreferenceRepository.save(preference);
            log.debug("Removed feed item {} from liked videos for user {}", feedItemId, userDetailId);
        }
    }

    @Override
    @Transactional
    public UserPreference getOrCreatePreference(String userDetailId) {
        return userPreferenceRepository.findByUserDetailId(userDetailId)
                .orElseGet(() -> {
                    UserPreference preference = UserPreference.builder()
                            .userDetailId(userDetailId)
                            .likedVideos(new HashSet<>())
                            .watchedList(new HashSet<>())
                            .build();
                    UserPreference saved = userPreferenceRepository.save(preference);
                    log.debug("Created preference for user {}", userDetailId);
                    return saved;
                });
    }

    private Set<String> ensureMutable(Set<String> source) {
        return source == null ? new HashSet<>() : new HashSet<>(source);
    }

    private long adjustCounter(Long current, int delta) {
        long base = safeValue(current);
        long updated = base + delta;
        return Math.max(0, updated);
    }

    private long safeValue(Long value) {
        return value == null ? 0L : value;
    }
}

