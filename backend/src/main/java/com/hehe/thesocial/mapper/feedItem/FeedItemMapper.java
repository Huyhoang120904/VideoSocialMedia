package com.hehe.thesocial.mapper.feedItem;

import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.HashTag;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface FeedItemMapper {

    @Mapping(target = "hashTagIds", source = "hashTags", qualifiedByName = "hashTagIds")
    @Mapping(target = "hashTags", source = "hashTags", qualifiedByName = "hashTagNames")
    FeedItemResponse toFeedItemResponse(FeedItem feedItem);

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
