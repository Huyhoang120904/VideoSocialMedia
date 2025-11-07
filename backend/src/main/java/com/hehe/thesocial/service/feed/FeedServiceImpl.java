package com.hehe.thesocial.service.feed;

import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.dto.response.feedItem.FeedItemListResponse;
import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.Video;
import com.hehe.thesocial.entity.enums.FeedItemType;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.repository.VideoRepository;
import com.hehe.thesocial.service.recommendation.RecommendationServiceImpl;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FeedServiceImpl implements FeedService {
    VideoRepository videoRepository;
    FileMapper fileMapper;
    RecommendationServiceImpl recommendationService;

    @Override
    public Page<FeedItemResponse> getAllFeedItems(Pageable pageable) {
        log.info("Getting all videos for feed with page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        // Fetch all Videos
        Page<Video> videos = videoRepository.findAll(pageable);
        log.info("Found {} videos", videos.getTotalElements());

        // Map each Video to FeedItemResponse
        return videos.map(this::convertVideoToFeedItem);
    }

    private FeedItemResponse convertVideoToFeedItem(Video video) {
        FeedItemResponse.FeedItemResponseBuilder builder = FeedItemResponse.builder()
                .id(video.getId())
                .feedItemType(FeedItemType.VIDEO)
                .createdAt(video.getCreatedAt())
                .updatedAt(video.getUpdatedAt());

        // Convert video FileDocument to FileResponse
        if (video.getFile() != null) {
            builder.video(fileMapper.toFileResponse(video.getFile()));
        }

        // Set default counts (metadata and hashtags not yet implemented in Video entity)
        builder.likeCount(0L)
               .commentCount(0L)
               .shareCount(0L);

        return builder.build();
    }

    @Override
    public Page<FeedItemResponse> getPersonalizedFeed(Pageable pageable) {
        log.info("Getting personalized feed with page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

        // Get scored recommendations from RecommendationService
        Page<FeedItemResponse>  response =
                recommendationService.personalRecommendation(pageable);

        log.info("Found {} personalized feed items", response.getContent().size());

        // Create a Page from the list
        return response;
    }

    private FeedItemResponse convertFeedItemToResponse(FeedItem feedItem) {
        FeedItemResponse.FeedItemResponseBuilder builder = FeedItemResponse.builder()
                .id(feedItem.getId())
                .feedItemType(feedItem.getFeedItemType())
                .createdAt(feedItem.getCreatedAt())
                .updatedAt(feedItem.getUpdatedAt());

        // Convert video if present
        if (feedItem.getVideo() != null && feedItem.getVideo().getFile() != null) {
            builder.video(fileMapper.toFileResponse(feedItem.getVideo().getFile()));
        }

        // Set hashtag IDs if present
        if (feedItem.getHashTags() != null) {
            builder.hashTagIds(feedItem.getHashTags().stream()
                    .map(hashTag -> hashTag.getId())
                    .collect(Collectors.toSet()));
        }

        // Set comment IDs if present
        if (feedItem.getComments() != null) {
            builder.commentIds(feedItem.getComments().stream()
                    .map(comment -> comment.getId())
                    .collect(Collectors.toSet()));
        }

        // Set metadata counts if present
        if (feedItem.getMetaData() != null) {
            builder.likeCount(feedItem.getMetaData().getLoveCount())
                   .commentCount(feedItem.getMetaData().getCommentsCount())
                   .shareCount(feedItem.getMetaData().getSharesCount());
        } else {
            builder.likeCount(0L)
                   .commentCount(0L)
                   .shareCount(0L);
        }

        return builder.build();
    }
}

