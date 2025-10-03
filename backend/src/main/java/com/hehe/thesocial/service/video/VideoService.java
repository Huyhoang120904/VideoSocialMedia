package com.hehe.thesocial.service.video;


import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.response.file.FileResponse;
import org.springframework.data.domain.Page;

import org.springframework.data.domain.Pageable;

public interface VideoService {
    Page<FileResponse> getAllVideos(Pageable pageable);
}
