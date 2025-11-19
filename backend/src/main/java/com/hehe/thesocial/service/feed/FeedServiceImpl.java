package com.hehe.thesocial.service.feed;

import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.dto.response.feed.ImageSlideResponse;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.HashTag;
import com.hehe.thesocial.dto.response.feedItem.FeedItemListResponse;
import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.Video;
import com.hehe.thesocial.entity.enums.FeedItemType;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.mapper.userDetail.UserDetailMapper;
import com.hehe.thesocial.repository.FeedItemRepository;
import com.hehe.thesocial.repository.VideoRepository;
import com.hehe.thesocial.service.recommendation.RecommendationServiceImpl;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FeedServiceImpl implements FeedService {
    FeedItemRepository feedItemRepository;
    FileMapper fileMapper;
    RecommendationServiceImpl recommendationService;
    UserDetailMapper userDetailMapper;

    @Override
    public Page<FeedItemResponse> getAllFeedItems(Pageable pageable) {
        log.info("Getting all feed items with page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        // Fetch all FeedItems WITH METADATA using aggregation (returns Slice)
        Slice<FeedItem> feedItemsSlice = feedItemRepository.findAllWithMetadata(pageable);
        log.info("Found {} feed items with metadata", feedItemsSlice.getNumberOfElements());

        // Convert Slice to Page (we need to get total count separately)
        List<FeedItemResponse> content = feedItemsSlice.getContent().stream()
                .map(this::convertFeedItemToResponse)
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

    private FeedItemResponse convertFeedItemToResponse(FeedItem feedItem) {
        log.debug("Converting FeedItem: {}", feedItem.getId());

        FeedItemResponse.FeedItemResponseBuilder builder = FeedItemResponse.builder()
                .id(feedItem.getId())
                .feedItemType(feedItem.getFeedItemType())
                .title(feedItem.getTitle())
                .description(feedItem.getDescription())
                .createdAt(feedItem.getCreatedAt())
                .updatedAt(feedItem.getUpdatedAt());

        // Convert Video if present
        if (feedItem.getFeedItemType() == FeedItemType.VIDEO && feedItem.getVideo() != null) {
            builder.video(fileMapper.toFileResponse(feedItem.getVideo().getFile()));
        }

        // Convert ImageSlide if present
        if (feedItem.getFeedItemType() == FeedItemType.IMAGE_SLIDE && feedItem.getImageSlide() != null) {
            ImageSlideResponse imageSlideResponse = ImageSlideResponse.builder()
                    .id(feedItem.getImageSlide().getId())
                    .images(feedItem.getImageSlide().getImages().stream()
                            .map(fileMapper::toFileResponse)
                            .collect(Collectors.toList()))
                    .createdAt(feedItem.getImageSlide().getCreatedAt())
                    .updatedAt(feedItem.getImageSlide().getUpdatedAt())
                    .build();
            builder.imageSlide(imageSlideResponse);
        }

        // Get current user's userDetailId from JWT token
        String currentUserDetailId = getCurrentUserDetailId();

        // Check if current user has loved this feed item
        boolean isLoved = false;
        if (currentUserDetailId != null && feedItem.getLovedBy() != null) {
            isLoved = feedItem.getLovedBy().contains(currentUserDetailId);
        }

        // Set counts from metadata (NOW METADATA SHOULD BE POPULATED!)
        long likeCount = 0;
        long commentCount = 0;
        if (feedItem.getMetaData() != null) {
            log.debug("FeedItem {} has metadata: loveCount={}, commentsCount={}",
                feedItem.getId(),
                feedItem.getMetaData().getLoveCount(),
                feedItem.getMetaData().getCommentsCount());
            if (feedItem.getMetaData().getLoveCount() != null) {
                likeCount = feedItem.getMetaData().getLoveCount();
            }
            if (feedItem.getMetaData().getCommentsCount() != null) {
                commentCount = feedItem.getMetaData().getCommentsCount();
            }
        } else {
            log.warn("FeedItem {} has NO metadata!", feedItem.getId());
        }

        builder.likeCount(likeCount)
               .commentCount(commentCount)
               .shareCount(0L) // Share count not yet implemented
               .loved(isLoved); // Set loved status

        // Set hashtags
        if (feedItem.getHashTags() != null && !feedItem.getHashTags().isEmpty()) {
            Set<String> hashTagNames = feedItem.getHashTags().stream()
                    .map(HashTag::getName)
                    .collect(Collectors.toSet());
            builder.hashTags(hashTagNames);
        }

        // Set uploader information
        if (feedItem.getUploader() != null) {
            builder.uploader(userDetailMapper.toUserDetailResponse(feedItem.getUploader()));
        }

        return builder.build();
    }

    /**
     * Get current user's userDetailId from JWT token in Spring Security context
     * Returns null if user is not authenticated
     */
    private String getCurrentUserDetailId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication instanceof JwtAuthenticationToken jwtAuth) {
                Jwt jwt = jwtAuth.getToken();
                return jwt.getClaim("userDetailId");
            }

            return null;
        } catch (Exception e) {
            log.warn("Failed to get userDetailId from security context", e);
            return null;
        }
    }
}

