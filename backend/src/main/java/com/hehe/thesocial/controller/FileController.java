package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.service.file.FileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileController {

    FileService fileService;

    @GetMapping
    public ApiResponse<Page<FileResponse>> getAllFile(@PageableDefault(size = 12, page = 0) Pageable pageable) {
        return ApiResponse.<Page<FileResponse>>builder()
                .result(fileService.findAllDocument(pageable))
                .build();
    }

    @GetMapping("/{fileId}")
    public ApiResponse<FileResponse> getAllFile(@PathVariable String fileId) {
        return ApiResponse.<FileResponse>builder()
                .result(fileService.findDocumentById(fileId))
                .build();
    }

    @PostMapping
    public ApiResponse<FileResponse> uploadFile(@RequestParam("file") MultipartFile multipartFile) {
        return ApiResponse.<FileResponse>builder()
                .result(fileService.storeFile(multipartFile))
                .build();
    }

    @PostMapping("/multi")
    public ApiResponse<List<FileResponse>> uploadFile(@RequestParam("files") MultipartFile[] multipartFiles) {
        return ApiResponse.<List<FileResponse>>builder()
                .result(fileService.storeMultipleFile(multipartFiles))
                .build();
    }

    @DeleteMapping("/{fileId}")
    public ApiResponse<?> deleteFile(@PathVariable String fileId) {
        fileService.deleteFile(fileId);
        return ApiResponse.builder().build();
    }


}
