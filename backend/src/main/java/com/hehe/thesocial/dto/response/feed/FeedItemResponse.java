package com.hehe.thesocial.dto.response.feed;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.dto.response.userDetail.UserDetailResponse;
import com.hehe.thesocial.entity.enums.FeedItemType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FeedItemResponse {
    String id;
    FeedItemType feedItemType;
    FileResponse video;
    ImageSlideResponse imageSlide;
    String title;
    String description;
    Set<String> hashTagIds;
    Set<String> commentIds;
    long likeCount;
    long commentCount;
    long shareCount;
    long viewCount;
    boolean active;
    boolean violated;
    LocalDateTime disabledAt;
    UserDetailResponse disabledBy;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    boolean loved;
    Set<String> hashTags;
    UserDetailResponse uploader; // Thông tin người upload
}

