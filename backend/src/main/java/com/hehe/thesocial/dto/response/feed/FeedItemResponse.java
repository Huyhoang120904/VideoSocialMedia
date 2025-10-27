package com.hehe.thesocial.dto.response.feed;

import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.entity.enums.FeedItemType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedItemResponse {
    String id;
    FeedItemType feedItemType;
    FileResponse video;
    Set<String> hashTagIds;
    Set<String> commentIds;
    long likeCount;
    long commentCount;
    long shareCount;
    java.time.Instant createdAt;
    java.time.Instant updatedAt;
}

