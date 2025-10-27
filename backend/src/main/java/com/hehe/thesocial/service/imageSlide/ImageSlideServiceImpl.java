package com.hehe.thesocial.service.imageSlide;

import com.hehe.thesocial.dto.request.imageSlide.ImageSlideUploadRequest;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.dto.response.imageSlide.ImageSlideUploadResponse;
import com.hehe.thesocial.entity.FileDocument;
import com.hehe.thesocial.entity.ImageSlide;
import com.hehe.thesocial.entity.MetaData;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.entity.HashTag;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.repository.FileRepository;
import com.hehe.thesocial.repository.HashTagRepository;
import com.hehe.thesocial.repository.ImageSlideRepository;
import com.hehe.thesocial.repository.MetaDataRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.service.file.FileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class ImageSlideServiceImpl implements ImageSlideService {
    
    final FileRepository fileRepository;
    final FileMapper fileMapper;
    final FileService fileService;
    final ImageSlideRepository imageSlideRepository;
    final UserDetailRepository userDetailRepository;
    final MetaDataRepository metaDataRepository;
    final HashTagRepository hashTagRepository;
    
    @Value("${file.upload-dir:uploads}")
    String uploadDir;
    
    @Value("${server.host}")
    String serverHost;
    
    @Value("${server.port:8082}")
    String serverPort;
    
    @Value("${server.servlet.context-path:/api/v1}")
    String contextPath;

    @Override
    public Page<FileResponse> getAllImageSlides(Pageable pageable) {
        log.info("Getting all image slides with page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        
        Page<ImageSlide> imageSlides = imageSlideRepository.findAll(pageable);
        log.info("Found {} image slides", imageSlides.getTotalElements());
        
        if (imageSlides.getTotalElements() == 0) {
            log.warn("No image slides found in database!");
        }
        
        return imageSlides.map(fileMapper::toFileResponseFromImageSlide);
    }

    @Override
    public Page<FileResponse> getImageSlidesByUserId(String userDetailId, Pageable pageable) {
        log.info("Getting image slides for userDetail ID: {} with page: {}, size: {}", userDetailId, pageable.getPageNumber(), pageable.getPageSize());
        
        UserDetail userDetail = userDetailRepository.findById(userDetailId)
                .orElseThrow(() -> new RuntimeException("UserDetail not found with ID: " + userDetailId));
        
        Page<ImageSlide> imageSlides = imageSlideRepository.findByUploader(userDetail, pageable);
        log.info("Found {} image slides for user: {}", imageSlides.getTotalElements(), userDetail.getDisplayName());
        
        return imageSlides.map(fileMapper::toFileResponseFromImageSlide);
    }

    @Override
    @Transactional
    public ImageSlideUploadResponse uploadImageSlide(ImageSlideUploadRequest request) {
        log.info("Uploading image slide with {} images, captions: {}, has thumbnail: {}", 
                request.getImages().size(), request.getCaptions(), 
                request.getThumbnail() != null && !request.getThumbnail().isEmpty());

        if (request.getImages() == null || request.getImages().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }

        // Validate all images
        for (MultipartFile image : request.getImages()) {
            validateImageFile(image);
        }

        // Get current user
        UserDetail uploader = getCurrentUser();

        // Process and store all images
        List<FileDocument> imageFiles = new ArrayList<>();
        List<FileResponse> imageResponses = new ArrayList<>();
        
        for (MultipartFile image : request.getImages()) {
            FileResponse savedFile = fileService.storeFile(image);
            FileDocument fileDocument = fileRepository.findById(savedFile.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
            imageFiles.add(fileDocument);
            imageResponses.add(savedFile);
            log.info("Image file stored with ID: {}", savedFile.getId());
        }

        // Process thumbnail if provided
        FileDocument thumbnailFileDocument = null;
        if (request.getThumbnail() != null && !request.getThumbnail().isEmpty()) {
            validateImageFile(request.getThumbnail());
            thumbnailFileDocument = processThumbnail(request.getThumbnail());
        }

        // Create MetaData entity
        MetaData metaData = MetaData.builder()
                .lovesCount(0L)
                .commentsCount(0L)
                .favouritesCount(0L)
                .viewsCount(0L)
                .sharesCount(0L)
                .build();
        
        metaData = metaDataRepository.save(metaData);
        log.info("MetaData created with ID: {}", metaData.getId());

        // Process hashTags if provided
        List<HashTag> hashTags = null;
        if (request.getHashTags() != null && !request.getHashTags().isEmpty()) {
            hashTags = processHashTags(request.getHashTags());
            log.info("Processed {} hashTags", hashTags.size());
        }

        // Create ImageSlide entity
        ImageSlide imageSlide = ImageSlide.builder()
                .uploader(uploader)
                .images(imageFiles)
                .thumbnail(thumbnailFileDocument)
                .captions(request.getCaptions() != null ? request.getCaptions() : "")
                .metaData(metaData)
                .hashTags(hashTags)
                .build();

        imageSlide = imageSlideRepository.save(imageSlide);
        log.info("ImageSlide entity created with ID: {}", imageSlide.getId());

        return ImageSlideUploadResponse.builder()
                .images(imageResponses)
                .message("Image slide uploaded successfully")
                .uploadId(imageSlide.getId())
                .thumbnailUrl(thumbnailFileDocument != null ? thumbnailFileDocument.getUrl() : null)
                .captions(imageSlide.getCaptions())
                .build();
    }

    // Private helper methods
    
    private void validateImageFile(MultipartFile file) {
        if (!isImage(file)) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }
    }
    
    private boolean isImage(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }
    
    private FileDocument processThumbnail(MultipartFile thumbnail) {
        try {
            log.info("Processing thumbnail: {}, size: {}", 
                    thumbnail.getOriginalFilename(), thumbnail.getSize());
            
            String uploader = getCurrentUserId();
            
            // Create thumbnail directory
            String thumbnailDir = uploadDir + "/thumbnailImage/" + uploader;
            Path thumbnailPath = Paths.get(thumbnailDir);
            Files.createDirectories(thumbnailPath);
            
            // Generate unique filename
            String fileExtension = getFileExtension(thumbnail.getOriginalFilename());
            String uniqueFilename = UUID.randomUUID() + fileExtension;
            
            // Save thumbnail
            Path thumbnailFilePath = thumbnailPath.resolve(uniqueFilename);
            Files.copy(thumbnail.getInputStream(), thumbnailFilePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Create URL
            String host = (serverHost != null && !serverHost.isEmpty()) ? serverHost : "172.20.82.76";
            String thumbnailUrl = "http://" + host + ":" + serverPort + contextPath + 
                   "/files/thumbnailImage/" + uploader + "/" + uniqueFilename;
            
            // Create FileDocument for thumbnail
            FileDocument thumbnailFileDocument = FileDocument.builder()
                    .fileName(thumbnail.getOriginalFilename())
                    .size(thumbnail.getSize())
                    .url(thumbnailUrl)
                    .format(fileExtension.substring(1)) // Remove the dot
                    .resourceType("image")
                    .build();
            
            // Save and return FileDocument
            thumbnailFileDocument = fileRepository.save(thumbnailFileDocument);
            
            log.info("Thumbnail processed successfully: {}", thumbnailUrl);
            return thumbnailFileDocument;
        } catch (Exception e) {
            log.error("Failed to process thumbnail: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.ERROR_UPLOADING_FILE);
        }
    }
    
    private List<HashTag> processHashTags(List<String> hashTagNames) {
        List<HashTag> hashTags = new ArrayList<>();
        
        for (String name : hashTagNames) {
            if (name != null && !name.trim().isEmpty()) {
                String trimmedName = name.trim();
                
                // Check if hashtag already exists
                HashTag existingTag = hashTagRepository.findByName(trimmedName);
                
                if (existingTag != null) {
                    hashTags.add(existingTag);
                } else {
                    // Create new hashtag
                    HashTag newTag = HashTag.builder()
                            .name(trimmedName)
                            .viewCount(0)
                            .videoCount(0)
                            .build();
                    newTag = hashTagRepository.save(newTag);
                    hashTags.add(newTag);
                    log.info("Created new hashtag: {}", trimmedName);
                }
            }
        }
        
        return hashTags;
    }
    
    private UserDetail getCurrentUser() {
        String userId = getCurrentUserId();
        return userDetailRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
    
    private String getCurrentUserId() {
        return org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
    }
    
    private String getFileExtension(String filename) {
        if (filename == null) return "";
        int lastDotIndex = filename.lastIndexOf(".");
        return lastDotIndex == -1 ? "" : filename.substring(lastDotIndex);
    }
}

