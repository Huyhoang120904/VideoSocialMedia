package com.hehe.thesocial.service.file;

import com.hehe.thesocial.dto.request.file.FileActionRequest;
import com.hehe.thesocial.dto.request.file.FileSearchRequest;
import com.hehe.thesocial.dto.response.file.FileListResponse;
import com.hehe.thesocial.dto.response.file.FileMetricsResponse;
import com.hehe.thesocial.dto.response.file.FileResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public interface FileService {
    FileResponse storeFile(MultipartFile multipartFile);

    List<FileResponse> storeMultipleFile(MultipartFile[] multipartFiles);

    FileResponse findDocumentById(String id);

    Page<FileResponse> findAllDocument(Pageable pageable);

    FileResponse deleteFile(String id, FileActionRequest request);

    FileResponse restoreFile(String id, FileActionRequest request);

    FileResponse flagFile(String id, FileActionRequest request);

    FileResponse unflagFile(String id, FileActionRequest request);

    FileListResponse searchFiles(FileSearchRequest request);

    FileMetricsResponse getFileMetrics();
}
