package com.hehe.thesocial.dto.response.video;

import lombok.*;
import lombok.experimental.FieldDefaults;
import com.hehe.thesocial.dto.response.file.FileResponse;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VideoUploadResponse {
    FileResponse video;
    
    String message;
    
    String uploadId;
    
    String thumbnailUrl;
}
