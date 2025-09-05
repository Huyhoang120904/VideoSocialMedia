package com.hehe.thesocial.service.file;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.entity.FileDocument;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.repository.FileRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileServiceImpl implements FileService {
    FileMapper fileMapper;
    FileRepository fileRepository;
    Cloudinary cloudinary;

    @Override
    public FileResponse storeFile(MultipartFile multipartFile) {
        String uploader = SecurityContextHolder.getContext().getAuthentication().getName();
        if (multipartFile.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }
        Map<String, String> params = new HashMap<>();

        String folder = "uploads/" + uploader;

        params.put("folder", folder);
        params.put("public_id", UUID.randomUUID().toString());
        params.put("resource_type", "auto");

        try {
            Map uploadResult = cloudinary.uploader().upload(multipartFile.getBytes(), params);

            FileDocument fileDocument = FileDocument.builder().fileName(multipartFile.getOriginalFilename()).size(multipartFile.getSize()).publicId((String) uploadResult.get("public_id")).url((String) uploadResult.get("url")).secureUrl((String) uploadResult.get("secure_url")).format((String) uploadResult.get("format")).resourceType((String) uploadResult.get("resource_type")).build();

            if (uploadResult.containsKey("height") && uploadResult.containsKey("width")) {
                fileDocument.setHeight((int) uploadResult.get("height"));
                fileDocument.setWidth((int) uploadResult.get("width"));
            }
            fileDocument = fileRepository.save(fileDocument);

            return fileMapper.toFileResponse(fileDocument);
        } catch (IOException e) {
            log.info("Failed to delete file from Cloudinary: {}", e.getMessage());
            throw new AppException(ErrorCode.ERROR_UPLOADING_FILE);
        }
    }

    @Override
    public List<FileResponse> storeMultipleFile(MultipartFile[] multipartFiles) {
        return Arrays.stream(multipartFiles).map(this::storeFile).toList();
    }

    @Override
    public FileResponse findDocumentById(String id) {
        FileDocument fileDocument = fileRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
        return fileMapper.toFileResponse(fileDocument);
    }

    @Override
    public Page<FileResponse> findAllDocument(Pageable pageable) {
        Page<FileDocument> fileDocuments = fileRepository.findAll(pageable);
        return fileDocuments.map(fileMapper::toFileResponse);
    }

    @Override
    public void deleteFile(String id) {
        FileDocument fileDocument = fileRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
        try {
            cloudinary.uploader().destroy(fileDocument.getPublicId(), ObjectUtils.asMap("resource_type", fileDocument.getResourceType()));
        } catch (Exception e) {
            log.info("Failed to delete file from Cloudinary: {}", e.getMessage());
            throw new AppException(ErrorCode.ERROR_UPLOADING_FILE);
        }
        fileRepository.deleteById(fileDocument.getId());
    }

}
