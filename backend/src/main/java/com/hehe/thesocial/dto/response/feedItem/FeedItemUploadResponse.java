package com.hehe.thesocial.dto.response.feedItem;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.entity.enums.FeedItemType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FeedItemUploadResponse {
    String feedItemId;
    FeedItemType feedItemType;
    String message;

    // Video fields
    FileResponse video;

    // ImageSlide fields
    List<FileResponse> images;
    String captions;

    // Common fields
    String thumbnailUrl;
    String title;
    String description;

    // Metadata fields
    Long likeCount;
    Long commentCount;
    Long shareCount;
    Long viewCount;

}

