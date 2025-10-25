package com.hehe.thesocial.service.video;


import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.response.file.FileResponse;
import org.springframework.data.domain.Page;

import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface VideoService {
    Page<FileResponse> getAllVideos(Pageable pageable);
    
    Page<FileResponse> getVideosByUserId(String userId, Pageable pageable);

    ApiResponse<FileResponse> uploadVideo(MultipartFile file, String title, String description);

    ApiResponse<String> uploadToTikTok(MultipartFile file);

    ApiResponse<String> uploadById(String fileId);

    ApiResponse<String> uploadWithMeta(MultipartFile file, String title, String description, String hashtags);
}
