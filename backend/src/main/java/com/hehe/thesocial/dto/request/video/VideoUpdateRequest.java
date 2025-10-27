package com.hehe.thesocial.dto.request.video;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VideoUpdateRequest {
    String title;
    
    String description;
    
    MultipartFile thumbnail;
}

