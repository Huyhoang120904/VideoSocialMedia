package com.hehe.thesocial.mapper.feedItem;

import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.dto.response.feed.ImageSlideResponse;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.HashTag;
import com.hehe.thesocial.entity.ImageSlide;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.entity.Video;
import com.hehe.thesocial.entity.enums.FeedItemType;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.mapper.userDetail.UserDetailMapper;
import org.mapstruct.AfterMapping;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {FileMapper.class, UserDetailMapper.class})
public interface FeedItemMapper {

    @Mapping(target = "hashTagIds", source = "hashTags", qualifiedByName = "hashTagIds")
    @Mapping(target = "hashTags", source = "hashTags", qualifiedByName = "hashTagNames")
    @Mapping(target = "video", ignore = true)
    @Mapping(target = "imageSlide", ignore = true)
    @Mapping(target = "likeCount", ignore = true)
    @Mapping(target = "commentCount", ignore = true)
    @Mapping(target = "shareCount", ignore = true)
    @Mapping(target = "viewCount", ignore = true)
    @Mapping(target = "loved", ignore = true)
    @Mapping(target = "uploader", ignore = true)
    FeedItemResponse toFeedItemResponse(FeedItem feedItem, 
                                        @Context FileMapper fileMapper,
                                        @Context UserDetailMapper userDetailMapper,
                                        @Context String currentUserDetailId);

    @AfterMapping
    default void mapVideoAndImageSlide(@MappingTarget FeedItemResponse response, 
                                       FeedItem feedItem, 
                                       @Context FileMapper fileMapper) {
        // Map video if present
        if (feedItem.getFeedItemType() == FeedItemType.VIDEO && 
            feedItem.getVideo() != null && 
            feedItem.getVideo().getFile() != null) {
            response.setVideo(fileMapper.toFileResponse(feedItem.getVideo().getFile()));
        }

        // Map imageSlide if present
        if (feedItem.getFeedItemType() == FeedItemType.IMAGE_SLIDE && 
            feedItem.getImageSlide() != null) {
            List<FileResponse> imageResponses = null;
            if (feedItem.getImageSlide().getImages() != null && !feedItem.getImageSlide().getImages().isEmpty()) {
                imageResponses = feedItem.getImageSlide().getImages().stream()
                        .map(fileMapper::toFileResponse)
                        .collect(Collectors.toList());
            }
            response.setImageSlide(ImageSlideResponse.builder()
                    .id(feedItem.getImageSlide().getId())
                    .images(imageResponses)
                    .createdAt(feedItem.getImageSlide().getCreatedAt())
                    .updatedAt(feedItem.getImageSlide().getUpdatedAt())
                    .build());
        }
    }

    @AfterMapping
    default void mapMetadataAndLovedStatus(@MappingTarget FeedItemResponse response,
                                           FeedItem feedItem,
                                           @Context String currentUserDetailId) {
        // Set counts from metadata
        long likeCount = 0;
        long commentCount = 0;
        long viewCount = 0;
        long shareCount = 0;

        if (feedItem.getMetaData() != null) {
            if (feedItem.getMetaData().getLoveCount() != null) {
                likeCount = feedItem.getMetaData().getLoveCount();
            }
            if (feedItem.getMetaData().getCommentsCount() != null) {
                commentCount = feedItem.getMetaData().getCommentsCount();
            }
            if (feedItem.getMetaData().getViewsCount() != null) {
                viewCount = feedItem.getMetaData().getViewsCount();
            }
            if (feedItem.getMetaData().getSharesCount() != null) {
                shareCount = feedItem.getMetaData().getSharesCount();
            }
        }

        response.setLikeCount(likeCount);
        response.setCommentCount(commentCount);
        response.setViewCount(viewCount);
        response.setShareCount(shareCount);

        // Check if current user has loved this feed item
        boolean isLoved = false;
        if (currentUserDetailId != null && feedItem.getLovedBy() != null) {
            isLoved = feedItem.getLovedBy().contains(currentUserDetailId);
        }
        response.setLoved(isLoved);
    }

    @AfterMapping
    default void mapUploader(@MappingTarget FeedItemResponse response,
                             FeedItem feedItem,
                             @Context UserDetailMapper userDetailMapper,
                             @Context FileMapper fileMapper) {
        // Set uploader information
        if (feedItem.getUploader() != null) {
            response.setUploader(userDetailMapper.toUserDetailResponse(feedItem.getUploader(), fileMapper));
        }
    }

    @Named("hashTagIds")
    default Set<String> mapHashTagsToIds(Set<HashTag> hashTags) {
        if (hashTags == null || hashTags.isEmpty()) {
            return Collections.emptySet();
        }
        return hashTags.stream()
                .map(HashTag::getId)
                .collect(Collectors.toSet());
    }

    @Named("hashTagNames")
    default Set<String> mapHashTagsToNames(Set<HashTag> hashTags) {
        if (hashTags == null || hashTags.isEmpty()) {
            return Collections.emptySet();
        }
        return hashTags.stream()
                .map(HashTag::getName)
                .collect(Collectors.toSet());
    }
}
