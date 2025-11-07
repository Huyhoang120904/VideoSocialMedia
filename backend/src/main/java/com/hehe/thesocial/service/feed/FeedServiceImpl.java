package com.hehe.thesocial.service.feed;

import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.entity.Video;
import com.hehe.thesocial.entity.enums.FeedItemType;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.repository.VideoRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FeedServiceImpl implements FeedService {
    VideoRepository videoRepository;
    FileMapper fileMapper;

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
}

