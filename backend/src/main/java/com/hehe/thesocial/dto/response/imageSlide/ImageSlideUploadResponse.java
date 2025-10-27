package com.hehe.thesocial.dto.response.imageSlide;

import lombok.*;
import lombok.experimental.FieldDefaults;
import com.hehe.thesocial.dto.response.file.FileResponse;

import java.util.List;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImageSlideUploadResponse {
    List<FileResponse> images;
    
    String message;
    
    String uploadId;
    
    String thumbnailUrl;
    
    String captions;
}

