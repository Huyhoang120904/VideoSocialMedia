package com.hehe.thesocial.service.video;


import com.hehe.thesocial.dto.request.video.*;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.dto.response.video.VideoUploadResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface VideoService {
    Page<FileResponse> getAllVideos(Pageable pageable);
    
    Page<FileResponse> getVideosByUserId(String userId, Pageable pageable);

    VideoUploadResponse uploadVideo(VideoUploadRequest request);

    FileResponse updateVideo(String videoId, VideoUpdateRequest request);
    
}
