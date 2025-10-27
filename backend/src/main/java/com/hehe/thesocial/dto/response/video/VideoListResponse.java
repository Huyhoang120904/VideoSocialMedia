package com.hehe.thesocial.dto.response.video;

import lombok.*;
import lombok.experimental.FieldDefaults;
import com.hehe.thesocial.dto.response.file.FileResponse;
import org.springframework.data.domain.Page;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VideoListResponse {
    Page<FileResponse> videos;
    
    String message;
    
    Long totalElements;
    
    Integer totalPages;
    
    Integer currentPage;
    
    Integer pageSize;
}
