package com.hehe.thesocial.dto.request.feedItem;

import com.hehe.thesocial.entity.enums.FeedItemType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedItemUploadRequest {
    FeedItemType feedItemType; // VIDEO or IMAGE_SLIDE

    // Common fields
    String title;
    String description;
    MultipartFile thumbnail;
    List<String> hashTags;

    // Video-specific fields
    MultipartFile videoFile;
    Double duration;

    // ImageSlide-specific fields
    List<MultipartFile> images;
    String captions;
}