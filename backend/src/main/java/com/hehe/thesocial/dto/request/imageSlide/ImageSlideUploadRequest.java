package com.hehe.thesocial.dto.request.imageSlide;

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
public class ImageSlideUploadRequest {
    @NotNull(message = "Image slides are required")
    List<MultipartFile> images;
    
    String captions;
    
    MultipartFile thumbnail;
    
    List<String> hashTags;
}

