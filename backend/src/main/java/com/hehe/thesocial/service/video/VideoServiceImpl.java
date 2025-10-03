package com.hehe.thesocial.service.video;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.entity.FileDocument;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.repository.FileRepository;
import com.hehe.thesocial.service.file.FileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestMapping;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VideoServiceImpl implements VideoService{
    FileRepository fileRepository;
    FileMapper fileMapper;
    FileService fileService;

    @Override
    public Page<FileResponse> getAllVideos(Pageable pageable) {
        Page<FileDocument> videos = fileRepository.findByResourceType("video", pageable);
        return videos.map(fileMapper::toFileResponse);
    }

}
