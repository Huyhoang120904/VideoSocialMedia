package com.hehe.thesocial.dto.request.video;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VideoUploadRequest {
    @NotNull(message = "Video file is required")
    MultipartFile file;
    
    String title;
    
    String description;
    
    MultipartFile thumbnail;
    
    Double duration;
    
    List<String> hashTags;
}
