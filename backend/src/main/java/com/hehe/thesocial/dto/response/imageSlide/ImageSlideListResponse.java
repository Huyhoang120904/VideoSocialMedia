package com.hehe.thesocial.dto.response.imageSlide;

import lombok.*;
import lombok.experimental.FieldDefaults;
import com.hehe.thesocial.dto.response.file.FileResponse;
import org.springframework.data.domain.Page;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImageSlideListResponse {
    Page<FileResponse> imageSlides;
    
    String message;
    
    long totalElements;
    
    int totalPages;
    
    int currentPage;
    
    int pageSize;
}

