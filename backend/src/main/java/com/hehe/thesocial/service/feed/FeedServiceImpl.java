package com.hehe.thesocial.service.feed;

import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.mapper.feedItem.FeedItemMapper;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.mapper.userDetail.UserDetailMapper;
import com.hehe.thesocial.repository.FeedItemRepository;
import com.hehe.thesocial.service.recommendation.RecommendationServiceImpl;
import com.hehe.thesocial.util.AuthenticationHelper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FeedServiceImpl implements FeedService {
    FeedItemRepository feedItemRepository;
    FeedItemMapper feedItemMapper;
    FileMapper fileMapper;
    UserDetailMapper userDetailMapper;
    RecommendationServiceImpl recommendationService;
    AuthenticationHelper authenticationHelper;

    @Override
    public Page<FeedItemResponse> getAllFeedItems(Pageable pageable) {
        log.info("Getting all feed items with page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        // Fetch all FeedItems WITH METADATA using aggregation (returns Slice)
        Slice<FeedItem> feedItemsSlice = feedItemRepository.findAllWithMetadata(pageable);
        log.info("Found {} feed items with metadata", feedItemsSlice.getNumberOfElements());

        // Get current user's userDetailId from JWT token
        String currentUserDetailId = authenticationHelper.getCurrentUserDetail().getId();

        // Convert Slice to Page using mapper
        List<FeedItemResponse> content = feedItemsSlice.getContent().stream()
                .map(item -> feedItemMapper.toFeedItemResponse(item, fileMapper, userDetailMapper, currentUserDetailId))
                .collect(Collectors.toList());

        // Get total count for Page
        long total = feedItemRepository.count();

        return new PageImpl<>(content, pageable, total);
    }

    @Override
    public Page<FeedItemResponse> getPersonalizedFeed(Pageable pageable) {
        log.info("Getting personalized feed items for page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());
        return recommendationService.personalRecommendation(pageable);
    }

    @Override
    public Page<FeedItemResponse> getExploreFeed(Pageable pageable) {
        log.info("Getting explore feed items for page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());
        return recommendationService.exploreFeed(pageable);
    }

    @Override
    public Page<FeedItemResponse> getFollowingFeed(Pageable pageable) {
        log.info("Getting following feed items for page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        UserDetail currentUser = authenticationHelper.getCurrentUserDetail();
        Set<UserDetail> following = currentUser.getFollowing();

        if (following == null || following.isEmpty()) {
            log.info("User {} is not following anyone. Returning empty following feed.", currentUser.getId());
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        Pageable effectivePageable = pageable.getSort().isSorted()
                ? pageable
                : PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<FeedItem> feedItems = feedItemRepository.findByUploaderIn(following, effectivePageable);

        List<FeedItemResponse> content = feedItems.getContent().stream()
                .map(item -> feedItemMapper.toFeedItemResponse(item, fileMapper, userDetailMapper, currentUser.getId()))
                .collect(Collectors.toList());

        return new PageImpl<>(content, effectivePageable, feedItems.getTotalElements());
    }
}

