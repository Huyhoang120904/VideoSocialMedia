package com.hehe.thesocial.service.metadata.view;

import com.hehe.thesocial.dto.response.metadata.ViewResponse;
import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.MetaData;
import com.hehe.thesocial.entity.UserPreference;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.repository.FeedItemRepository;
import com.hehe.thesocial.repository.MetaDataRepository;
import com.hehe.thesocial.repository.UserPreferenceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ViewServiceImpl implements ViewService {

    FeedItemRepository feedItemRepository;
    MetaDataRepository metaDataRepository;
    UserPreferenceRepository userPreferenceRepository;
    MongoTemplate mongoTemplate;

    @Override
    @Transactional
    public ViewResponse addView(String feedItemId, String userDetailId) {
        log.info("Adding view for feedItem {} by userDetail {}", feedItemId, userDetailId);

        FeedItem feedItem = feedItemRepository.findById(feedItemId)
                .orElseThrow(() -> new AppException(ErrorCode.FEED_ITEM_NOT_FOUND));

        // Ensure metadata exists before proceeding
        MetaData metaData = feedItem.getMetaData();
        boolean metadataWasNull = false;
        if (metaData == null) {
            metadataWasNull = true;
            metaData = MetaData.builder()
                    .loveCount(0L)
                    .commentsCount(0L)
                    .viewsCount(0L)
                    .sharesCount(0L)
                    .build();
        }

        // Get existing UserPreference or prepare for upsert
        UserPreference userPreference = userPreferenceRepository.findByUserDetailId(userDetailId)
                .orElse(null);

        Set<String> watchedList;
        if (userPreference != null) {
            watchedList = userPreference.getWatchedList();
            if (watchedList == null) {
                watchedList = new HashSet<>();
            }
        } else {
            watchedList = new HashSet<>();
        }

        boolean alreadyWatched = watchedList.contains(feedItemId);
        long currentViewsCount = metaData.getViewsCount() != null ? metaData.getViewsCount() : 0L;

        if (alreadyWatched) {
            log.debug("UserDetail {} already watched feedItem {}. Skipping view increment.", userDetailId, feedItemId);
        } else {
            currentViewsCount = currentViewsCount + 1;
            metaData.setViewsCount(currentViewsCount);
            metaData = metaDataRepository.save(metaData);

            // Attach metadata back to feed item if it was newly created
            if (metadataWasNull) {
                feedItem.setMetaData(metaData);
                feedItemRepository.save(feedItem);
            }

            // Add to watched list
            watchedList.add(feedItemId);

            // Use MongoTemplate upsert to avoid duplicate key error
            // This atomically updates if exists, or inserts if not exists
            Query query = new Query(Criteria.where("userDetailId").is(userDetailId));
            Update update = new Update()
                    .set("userDetailId", userDetailId)
                    .addToSet("watchedList", feedItemId);

            // Initialize other fields if creating new document
            if (userPreference == null) {
                update.setOnInsert("likedVideos", new HashSet<String>());
            }

            mongoTemplate.upsert(query, update, UserPreference.class);
            log.debug("Upserted UserPreference for userDetail {}, watchedList now contains feedItem {}",
                    userDetailId, feedItemId);
        }

        // Persist metadata if it was newly created but the user had already watched
        // (rare scenario)
        if (metadataWasNull && alreadyWatched) {
            metaData = metaDataRepository.save(metaData);
            feedItem.setMetaData(metaData);
            feedItemRepository.save(feedItem);
        }

        return ViewResponse.builder()
                .feedItemId(feedItemId)
                .viewsCount(currentViewsCount)
                .watched(true)
                .build();
    }
}
