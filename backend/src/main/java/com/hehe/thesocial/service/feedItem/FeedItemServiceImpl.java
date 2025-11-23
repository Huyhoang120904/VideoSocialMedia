package com.hehe.thesocial.service.feedItem;

import com.hehe.thesocial.dto.request.feedItem.FeedItemUploadRequest;
import com.hehe.thesocial.dto.response.feedItem.FeedItemUploadResponse;
import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.dto.response.reportTicket.ReportTicketResponse;
import com.hehe.thesocial.entity.*;
import com.hehe.thesocial.entity.enums.FeedItemType;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.mapper.feedItem.FeedItemMapper;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.mapper.reportTicket.ReportTicketMapper;
import com.hehe.thesocial.mapper.userDetail.UserDetailMapper;
import com.hehe.thesocial.repository.*;
import com.hehe.thesocial.service.file.FileService;
import com.hehe.thesocial.util.AuthenticationHelper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
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
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FeedItemServiceImpl implements FeedItemService {

    FeedItemRepository feedItemRepository;
    VideoRepository videoRepository;
    ImageSlideRepository imageSlideRepository;
    FileRepository fileRepository;
    FileService fileService;
    FileMapper fileMapper;
    FeedItemMapper feedItemMapper;
    UserDetailMapper userDetailMapper;
    UserDetailRepository userDetailRepository;
    MetaDataRepository metaDataRepository;
    HashTagRepository hashTagRepository;
    AuthenticationHelper authenticationHelper;
    UserPreferenceRepository userPreferenceRepository;
    ReportTicketRepository reportTicketRepository;
    ReportTicketMapper reportTicketMapper;

    @NonFinal
    @Value("${file.upload-dir:uploads}")
    String uploadDir;

    @NonFinal
    @Value("${server.host}")
    String serverHost;

    @NonFinal
    @Value("${server.port:8082}")
    String serverPort;

    @NonFinal
    @Value("${server.servlet.context-path:/api/v1}")
    String contextPath;

    @Override
    @Transactional
    public FeedItemUploadResponse uploadFeedItem(FeedItemUploadRequest request) {
        log.info("Uploading feed item of type: {}", request.getFeedItemType());

        if (request.getFeedItemType() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        return switch (request.getFeedItemType()) {
            case VIDEO -> uploadVideo(request);
            case IMAGE_SLIDE -> uploadImageSlide(request);
            default -> throw new AppException(ErrorCode.INVALID_REQUEST);
        };
    }

    @Override
    public Page<FeedItemUploadResponse> getAllFeedItems(Pageable pageable) {
        log.info("Getting all feed items with page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());

        Page<FeedItem> feedItems = feedItemRepository.findAll(pageable);
        log.info("Found {} feed items", feedItems.getTotalElements());

        return feedItems.map(this::toFeedItemUploadResponse);
    }

    @Override
    public Page<FeedItemResponse> getFeedItemsByUserDetailId(String userDetailId, Pageable pageable) {
        log.info("Getting feed items for user detail ID: {} with page: {}, size: {}", userDetailId, pageable.getPageNumber(), pageable.getPageSize());

        UserDetail userDetail = userDetailRepository.findById(userDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Page<FeedItem> feedItems = feedItemRepository.findByUploader(userDetail, pageable);
        log.info("Found {} feed items for user: {}", feedItems.getTotalElements(), userDetail.getDisplayName());

        String currentUserDetailId = null;
        try {
            currentUserDetailId = authenticationHelper.getCurrentUserDetail().getId();
        } catch (Exception ex) {
            log.debug("Could not determine current user detail id while fetching feed items for user {}", userDetailId);
        }

        String finalCurrentUserDetailId = currentUserDetailId;
        return feedItems.map(feedItem ->
                feedItemMapper.toFeedItemResponse(feedItem, fileMapper, userDetailMapper, finalCurrentUserDetailId)
        );
    }

    @Override
    public Page<FeedItemUploadResponse> getFeedItemsByType(FeedItemType feedItemType, Pageable pageable) {
        log.info("Getting feed items of type: {} with page: {}, size: {}", feedItemType, pageable.getPageNumber(), pageable.getPageSize());

        Page<FeedItem> feedItems = feedItemRepository.findByFeedItemType(feedItemType, pageable);
        log.info("Found {} feed items of type {}", feedItems.getTotalElements(), feedItemType);

        return feedItems.map(this::toFeedItemUploadResponse);
    }

    @Override
    public FeedItemResponse getFeedItemById(String feedItemId) {
        log.info("Fetching feed item by id {}", feedItemId);
        FeedItem feedItem = feedItemRepository.findById(feedItemId)
                .orElseThrow(() -> new AppException(ErrorCode.FEED_ITEM_NOT_FOUND));

        String currentUserDetailId = null;
        try {
            currentUserDetailId = authenticationHelper.getCurrentUserDetail().getId();
        } catch (Exception ex) {
            log.debug("Could not determine current user detail id while fetching feed item {}", feedItemId);
        }

        return feedItemMapper.toFeedItemResponse(feedItem, fileMapper, userDetailMapper, currentUserDetailId);
    }

    @Override
    public Page<FeedItemResponse> getLovedFeedItems(String userDetailId, Pageable pageable) {
        UserPreference userPreference = userPreferenceRepository.findByUserDetailId(userDetailId)
                .orElse(null);

        if (userPreference == null || userPreference.getLikedVideos() == null || userPreference.getLikedVideos().isEmpty()) {
            return Page.empty(pageable);
        }

        Page<FeedItem> lovedFeedItems = feedItemRepository.findByIdIn(userPreference.getLikedVideos(), pageable);

        return lovedFeedItems.map(feedItem ->
                feedItemMapper.toFeedItemResponse(feedItem, fileMapper, userDetailMapper, userDetailId)
        );
    }

    @Override
    public List<ReportTicketResponse> getReportsByFeedItemId(String feedItemId) {
        log.info("Fetching all reports for feedItem ID: {}", feedItemId);

        // Verify feedItem exists
        FeedItem feedItem = feedItemRepository.findById(feedItemId)
                .orElseThrow(() -> new AppException(ErrorCode.FEED_ITEM_NOT_FOUND));

        // Get all reports for this feedItem
        List<ReportTicket> reportTickets = reportTicketRepository.findByFeedItemId(feedItemId);
        log.info("Found {} reports for feedItem ID: {}", reportTickets.size(), feedItemId);

        // Map to response DTOs
        return reportTickets.stream()
                .map(reportTicket -> {
                    ReportTicketResponse response = reportTicketMapper.toReportTicketResponse(reportTicket);
                    // Set feedItemType from the feedItem
                    if (feedItem.getFeedItemType() != null) {
                        response.setFeedItemType(feedItem.getFeedItemType());
                    }
                    return response;
                })
                .toList();
    }

    @Override
    @Transactional
    public void disableFeedItemByViolation(String feedItemId) {
        log.info("Disabling feedItem ID: {} due to violation", feedItemId);

        FeedItem feedItem = feedItemRepository.findById(feedItemId)
                .orElseThrow(() -> new AppException(ErrorCode.FEED_ITEM_NOT_FOUND));

        // Set violated flag and disable the feedItem
        feedItem.setViolated(true);
        feedItem.setActive(false);

        feedItemRepository.save(feedItem);
        log.info("FeedItem ID: {} has been disabled due to violation", feedItemId);
    }

    // Private helper methods

    private FeedItemUploadResponse uploadVideo(FeedItemUploadRequest request) {
        log.info("Uploading video: {}, title: {}, description: {}",
                request.getVideoFile() != null ? request.getVideoFile().getOriginalFilename() : "null",
                request.getTitle(), request.getDescription());

        if (request.getVideoFile() == null || request.getVideoFile().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }

        validateVideoFile(request.getVideoFile());

        // Store video file
        FileResponse savedFile = fileService.storeFile(request.getVideoFile());
        log.info("Video file stored with ID: {}", savedFile.getId());

        FileDocument videoFileDocument = fileRepository.findById(savedFile.getId())
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        // Get current user
        UserDetail uploader = getCurrentUser();

        // Process thumbnail if provided
        FileDocument thumbnailFileDocument = null;
        if (request.getThumbnail() != null && !request.getThumbnail().isEmpty()) {
            thumbnailFileDocument = processThumbnail(request.getThumbnail());
        }

        // Create MetaData
        MetaData metaData = MetaData.builder()
                .loveCount(0L)
                .commentsCount(0L)
                .viewsCount(0L)
                .sharesCount(0L)
                .build();
        metaData = metaDataRepository.save(metaData);

        // Process hashTags
        HashSet<HashTag> hashTags = null;
        if (request.getHashTags() != null && !request.getHashTags().isEmpty()) {
            hashTags = new HashSet<>(processHashTags(request.getHashTags()));
        }

        // Create Video entity
        Video video = Video.builder()
                .file(videoFileDocument)
                .duration(request.getDuration() != null ? request.getDuration() : 0.0)
                .build();
        video = videoRepository.save(video);

        // Create FeedItem entity
        FeedItem feedItem = FeedItem.builder()
                .feedItemType(FeedItemType.VIDEO)
                .video(video)
                .title(request.getTitle() != null ? request.getTitle() : "")
                .description(request.getDescription() != null ? request.getDescription() : "")
                .uploader(uploader)
                .metaData(metaData)
                .hashTags(hashTags)
                .lovedBy(new HashSet<>())
                .build();

        feedItem = feedItemRepository.save(feedItem);
        log.info("FeedItem created with ID: {}", feedItem.getId());

        return FeedItemUploadResponse.builder()
                .feedItemId(feedItem.getId())
                .feedItemType(FeedItemType.VIDEO)
                .video(savedFile)
                .title(feedItem.getTitle())
                .description(feedItem.getDescription())
                .thumbnailUrl(thumbnailFileDocument != null ? thumbnailFileDocument.getUrl() : null)
                .message("Video uploaded successfully")
                .build();
    }

    private FeedItemUploadResponse uploadImageSlide(FeedItemUploadRequest request) {
        log.info("Uploading image slide with {} images, captions: {}",
                request.getImages() != null ? request.getImages().size() : 0,
                request.getCaptions());

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

        // Create MetaData
        MetaData metaData = MetaData.builder()
                .loveCount(0L)
                .commentsCount(0L)
                .viewsCount(0L)
                .sharesCount(0L)
                .build();
        metaData = metaDataRepository.save(metaData);

        // Process hashTags
        HashSet<HashTag> hashTags = null;
        if (request.getHashTags() != null && !request.getHashTags().isEmpty()) {
            hashTags = new HashSet<>(processHashTags(request.getHashTags()));
        }

        // Create ImageSlide entity
        ImageSlide imageSlide = ImageSlide.builder()
                .images(imageFiles)
                .build();
        imageSlide = imageSlideRepository.save(imageSlide);

        // Create FeedItem entity
        FeedItem feedItem = FeedItem.builder()
                .feedItemType(FeedItemType.IMAGE_SLIDE)
                .imageSlide(imageSlide)
                .title(request.getTitle() != null ? request.getTitle() : "")
                .description(request.getDescription() != null ? request.getDescription() : request.getCaptions())
                .uploader(uploader)
                .metaData(metaData)
                .hashTags(hashTags)
                .lovedBy(new HashSet<>())
                .build();

        feedItem = feedItemRepository.save(feedItem);
        log.info("FeedItem created with ID: {}", feedItem.getId());

        return FeedItemUploadResponse.builder()
                .feedItemId(feedItem.getId())
                .feedItemType(FeedItemType.IMAGE_SLIDE)
                .images(imageResponses)
                .captions(request.getCaptions())
                .title(feedItem.getTitle())
                .description(feedItem.getDescription())
                .thumbnailUrl(thumbnailFileDocument != null ? thumbnailFileDocument.getUrl() : null)
                .message("Image slide uploaded successfully")
                .build();
    }

    private void validateVideoFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }
    }

    private void validateImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }
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
                    .resourceType("image")
                    .build();

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

                HashTag existingTag = hashTagRepository.findByName(trimmedName);

                if (existingTag != null) {
                    hashTags.add(existingTag);
                } else {
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

    private FeedItemUploadResponse toFeedItemUploadResponse(FeedItem feedItem) {
        if (feedItem == null) {
            return null;
        }

        FeedItemUploadResponse.FeedItemUploadResponseBuilder builder = FeedItemUploadResponse.builder()
                .feedItemId(feedItem.getId())
                .feedItemType(feedItem.getFeedItemType())
                .title(feedItem.getTitle())
                .description(feedItem.getDescription());

        if (feedItem.getFeedItemType() == FeedItemType.VIDEO && feedItem.getVideo() != null) {
            Video video = feedItem.getVideo();
            if (video.getFile() != null) {
                builder.video(fileMapper.toFileResponse(video.getFile()));
            }
        } else if (feedItem.getFeedItemType() == FeedItemType.IMAGE_SLIDE && feedItem.getImageSlide() != null) {
            ImageSlide imageSlide = feedItem.getImageSlide();
            if (imageSlide.getImages() != null) {
                List<FileResponse> images = imageSlide.getImages().stream()
                        .map(fileMapper::toFileResponse)
                        .collect(Collectors.toList());
                builder.images(images);
            }
            builder.captions(feedItem.getDescription());
        }

        // Populate metadata fields
        if (feedItem.getMetaData() != null) {
            MetaData metaData = feedItem.getMetaData();
            builder.likeCount(metaData.getLoveCount() != null ? metaData.getLoveCount() : 0L);
            builder.commentCount(metaData.getCommentsCount() != null ? metaData.getCommentsCount() : 0L);
            builder.shareCount(metaData.getSharesCount() != null ? metaData.getSharesCount() : 0L);
            builder.viewCount(metaData.getViewsCount() != null ? metaData.getViewsCount() : 0L);
        } else {
            // Set default values if metadata is null
            builder.likeCount(0L);
            builder.commentCount(0L);
            builder.shareCount(0L);
            builder.viewCount(0L);
        }

        return builder.build();
    }

    private UserDetail getCurrentUser() {
        return authenticationHelper.getCurrentUserDetail();
    }

    private String getCurrentUserId() {
        return authenticationHelper.getCurrentUserDetail().getId();
    }

    private String getFileExtension(String filename) {
        if (filename == null) return "";
        int lastDotIndex = filename.lastIndexOf(".");
        return lastDotIndex == -1 ? "" : filename.substring(lastDotIndex);
    }
}

