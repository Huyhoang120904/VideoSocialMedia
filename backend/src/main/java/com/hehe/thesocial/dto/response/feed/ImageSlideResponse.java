package com.hehe.thesocial.dto.response.feed;

import com.hehe.thesocial.dto.response.file.FileResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImageSlideResponse {
    String id;
    List<FileResponse> images;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
