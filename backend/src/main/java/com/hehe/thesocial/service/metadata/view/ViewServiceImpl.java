package com.hehe.thesocial.service.metadata.view;

import com.hehe.thesocial.dto.response.metadata.ViewResponse;
import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.repository.FeedItemRepository;
import com.hehe.thesocial.service.feed.FeedEngagementService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ViewServiceImpl implements ViewService {

    FeedItemRepository feedItemRepository;
    FeedEngagementService feedEngagementService;

    @Override
    @Transactional
    public ViewResponse addView(String feedItemId, String userDetailId) {
        log.info("Adding view for feedItem {} by userDetail {}", feedItemId, userDetailId);

        FeedItem feedItem = feedItemRepository.findById(feedItemId)
                .orElseThrow(() -> new AppException(ErrorCode.FEED_ITEM_NOT_FOUND));

        long currentViewsCount = feedEngagementService.incrementViewCountIfNeeded(feedItem, userDetailId);

        return ViewResponse.builder()
                .feedItemId(feedItemId)
                .viewsCount(currentViewsCount)
                .watched(true)
                .build();
    }
}


