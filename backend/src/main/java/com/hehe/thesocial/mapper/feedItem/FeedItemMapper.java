package com.hehe.thesocial.mapper.feedItem;

import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.entity.FeedItem;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface FeedItemMapper {
    FeedItemResponse toFeedItemResponse(FeedItem feedItem);
}
