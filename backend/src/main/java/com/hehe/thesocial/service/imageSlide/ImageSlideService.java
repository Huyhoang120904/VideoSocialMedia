package com.hehe.thesocial.service.imageSlide;

import com.hehe.thesocial.dto.request.imageSlide.ImageSlideUploadRequest;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.dto.response.imageSlide.ImageSlideUploadResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ImageSlideService {
    Page<FileResponse> getAllImageSlides(Pageable pageable);
    
    Page<FileResponse> getImageSlidesByUserId(String userId, Pageable pageable);

    ImageSlideUploadResponse uploadImageSlide(ImageSlideUploadRequest request);
}

