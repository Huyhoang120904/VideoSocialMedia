package com.hehe.thesocial.mapper.feedItem;

import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.HashTag;
import org.mapstruct.Mapper;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface FeedItemMapper {
    FeedItemResponse toFeedItemResponse(FeedItem feedItem);

    default Set<String> map(Set<HashTag> hashTags) {
        if (hashTags == null) {
            return Collections.emptySet();
        }
        return hashTags.stream()
                .map(HashTag::getName)
                .collect(Collectors.toSet());
    }
}
