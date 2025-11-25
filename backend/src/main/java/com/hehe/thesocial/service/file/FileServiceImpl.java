package com.hehe.thesocial.service.file;

import com.hehe.thesocial.dto.request.file.FileActionRequest;
import com.hehe.thesocial.dto.request.file.FileSearchRequest;
import com.hehe.thesocial.dto.response.file.FileListResponse;
import com.hehe.thesocial.dto.response.file.FileMetricsResponse;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.entity.FileAuditLog;
import com.hehe.thesocial.entity.FileDocument;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.entity.enums.FileActionType;
import com.hehe.thesocial.entity.enums.FileStatus;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.mapper.userDetail.UserDetailMapper;
import com.hehe.thesocial.repository.FileAuditLogRepository;
import com.hehe.thesocial.repository.FileRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.repository.UserRepository;
import com.hehe.thesocial.specification.FileSpecification;
import com.hehe.thesocial.util.AuthenticationHelper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileServiceImpl implements FileService {
    FileMapper fileMapper;
    UserDetailMapper userDetailMapper;
    FileRepository fileRepository;
    UserDetailRepository userDetailRepository;
    UserRepository userRepository;
    FileAuditLogRepository fileAuditLogRepository;
    AuthenticationHelper authenticationHelper;
    MongoTemplate mongoTemplate;

    @NonFinal
    @Value("${file.upload-dir:uploads}")
    String uploadDir;

    @NonFinal
    @Value("${server.port:8082}")
    String serverPort;

    @NonFinal
    @Value("${server.servlet.context-path:/api/v1}")
    String contextPath;

    @NonFinal
    @Value("${server.host}")
    String serverHost;

    @Override
    public FileResponse storeFile(MultipartFile multipartFile, String thumbUrl) {
        UserDetail uploader = authenticationHelper.getCurrentUserDetail();

        if (multipartFile.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }

        try {
            // Create upload directory if it doesn't exist
            String userUploadDir = uploadDir + "/" + uploader.getId();
            Path uploadPath = Paths.get(userUploadDir);
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String originalFilename = multipartFile.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID() + fileExtension;

            // Save file to local storage
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(multipartFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Determine resource type based on file extension
            String resourceType = determineResourceType(fileExtension);

            // Create file URL using configured host (fallback to localhost if not configured)
            String host = (serverHost != null && !serverHost.isEmpty()) ? serverHost : "172.20.82.76";
            String fileUrl = "http://" + host + ":" + serverPort + contextPath + "/files/" + uploader.getId() + "/" + uniqueFilename;

            // Generate thumbnail for video files
            String thumbnailUrl = null;

            if (StringUtils.hasText(thumbnailUrl)) {
                thumbnailUrl = thumbUrl;
            } else {
                thumbnailUrl = "http://" + host + ":" + serverPort + contextPath + "/files/default-thumbnail.jpg";
            }

            FileDocument fileDocument = FileDocument.builder()
                    .fileName(uniqueFilename)
                    .originalFileName(originalFilename)
                    .size(multipartFile.getSize())
                    .url(fileUrl)
                    .resourceType(resourceType)
                    .thumbnailUrl(thumbnailUrl)
                    .uploader(uploader)
                    .build();

            fileDocument = fileRepository.save(fileDocument);
            return mapToDetailedResponse(fileDocument);

        } catch (IOException e) {
            log.error("Failed to store file: {}", e.getMessage());
            throw new AppException(ErrorCode.ERROR_UPLOADING_FILE);
        }
    }

    @Override
    public List<FileResponse> storeMultipleFile(MultipartFile[] multipartFiles) {
        return Arrays.stream(multipartFiles).map(file -> storeFile(file, "")).toList();
    }

    @Override
    public FileResponse findDocumentById(String id) {
        FileDocument fileDocument = fileRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
        return mapToDetailedResponse(fileDocument);
    }

    @Override
    public Page<FileResponse> findAllDocument(Pageable pageable) {
        Page<FileDocument> fileDocuments = fileRepository.findAll(pageable);
        return fileDocuments.map(this::mapToDetailedResponse);
    }

    @Override
    public FileResponse deleteFile(String id, FileActionRequest request) {
        requireReason(request, "delete");
        UserDetail actor = authenticationHelper.getCurrentUserDetail();
        FileDocument fileDocument = getFileOrThrow(id);

        if (fileDocument.getStatus() == FileStatus.DELETED) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        fileDocument.setStatus(FileStatus.DELETED);
        fileDocument.setDeletedAt(LocalDateTime.now());
        fileDocument.setDeletedBy(actor);
        fileDocument.setDeleteReason(request.getActionReason());

        fileDocument = fileRepository.save(fileDocument);
        recordAudit(fileDocument, FileActionType.DELETE, request.getActionReason(), actor);
        return mapToDetailedResponse(fileDocument);
    }

    @Override
    public FileResponse restoreFile(String id, FileActionRequest request) {
        UserDetail actor = authenticationHelper.getCurrentUserDetail();
        FileDocument fileDocument = getFileOrThrow(id);

        if (fileDocument.getStatus() != FileStatus.DELETED) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        fileDocument.setStatus(FileStatus.ACTIVE);
        fileDocument.setDeletedAt(null);
        fileDocument.setDeletedBy(null);
        fileDocument.setDeleteReason(null);

        fileDocument = fileRepository.save(fileDocument);
        recordAudit(fileDocument, FileActionType.RESTORE, request != null ? request.getActionReason() : null, actor);
        return mapToDetailedResponse(fileDocument);
    }

    @Override
    public FileResponse flagFile(String id, FileActionRequest request) {
        requireReason(request, "flag");
        UserDetail actor = authenticationHelper.getCurrentUserDetail();
        FileDocument fileDocument = getFileOrThrow(id);

        if (fileDocument.getStatus() == FileStatus.DELETED) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if (fileDocument.getStatus() == FileStatus.FLAGGED) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        fileDocument.setStatus(FileStatus.FLAGGED);
        fileDocument.setFlagReason(request.getActionReason());
        fileDocument.setFlaggedAt(LocalDateTime.now());
        fileDocument.setFlaggedBy(actor);

        fileDocument = fileRepository.save(fileDocument);
        recordAudit(fileDocument, FileActionType.FLAG, request.getActionReason(), actor);
        return mapToDetailedResponse(fileDocument);
    }

    @Override
    public FileResponse unflagFile(String id, FileActionRequest request) {
        UserDetail actor = authenticationHelper.getCurrentUserDetail();
        FileDocument fileDocument = getFileOrThrow(id);

        if (fileDocument.getStatus() != FileStatus.FLAGGED) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        fileDocument.setStatus(FileStatus.ACTIVE);
        fileDocument.setFlagReason(null);
        fileDocument.setFlaggedAt(null);
        fileDocument.setFlaggedBy(null);

        fileDocument = fileRepository.save(fileDocument);
        recordAudit(fileDocument, FileActionType.UNFLAG, request != null ? request.getActionReason() : null, actor);
        return mapToDetailedResponse(fileDocument);
    }

    @Override
    public FileListResponse searchFiles(FileSearchRequest request) {
        FileSearchRequest effectiveRequest = request != null ? request : FileSearchRequest.builder().build();
        validateSearchRequest(effectiveRequest);

        String uploaderId = resolveUploaderId(effectiveRequest);
        if (StringUtils.hasText(effectiveRequest.getUploaderUsername()) && !StringUtils.hasText(uploaderId)) {
            return buildEmptyListResponse(effectiveRequest);
        }

        Query baseQuery = FileSpecification.buildQuery(effectiveRequest, uploaderId);
        long total = mongoTemplate.count(baseQuery, FileDocument.class);

        Pageable pageable = buildPageable(effectiveRequest);
        Query pagedQuery = FileSpecification.buildQuery(effectiveRequest, uploaderId).with(pageable);

        List<FileDocument> documents = mongoTemplate.find(pagedQuery, FileDocument.class);
        List<FileResponse> responses = documents.stream()
                .map(this::mapToDetailedResponse)
                .toList();

        Page<FileResponse> page = new PageImpl<>(responses, pageable, total);
        return FileListResponse.builder()
                .files(page)
                .message(total == 0 ? "No files match the search criteria" : "Files retrieved successfully")
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .build();
    }

    @Override
    public FileMetricsResponse getFileMetrics() {
        long totalFiles = mongoTemplate.count(new Query(), FileDocument.class);
        long totalVideos = mongoTemplate.count(Query.query(Criteria.where("resource_type").is("video")), FileDocument.class);
        long totalImages = mongoTemplate.count(Query.query(Criteria.where("resource_type").is("image")), FileDocument.class);
        long flaggedFiles = mongoTemplate.count(Query.query(Criteria.where("status").is(FileStatus.FLAGGED)), FileDocument.class);
        long deletedFiles = mongoTemplate.count(Query.query(Criteria.where("status").is(FileStatus.DELETED)), FileDocument.class);
        long totalStorageBytes = aggregateTotalSize();

        long totalOtherFiles = Math.max(0, totalFiles - (totalVideos + totalImages));

        return FileMetricsResponse.builder()
                .totalFiles(totalFiles)
                .totalVideos(totalVideos)
                .totalImages(totalImages)
                .totalOtherFiles(totalOtherFiles)
                .flaggedFiles(flaggedFiles)
                .deletedFiles(deletedFiles)
                .totalStorageBytes(totalStorageBytes)
                .formattedStorageUsed(formatBytes(totalStorageBytes))
                .build();
    }

    private FileResponse mapToDetailedResponse(FileDocument fileDocument) {
        if (fileDocument == null) {
            return null;
        }

        FileResponse response = fileMapper.toFileResponse(fileDocument);

        if (fileDocument.getUploader() != null) {
            response.setUploader(userDetailMapper.toUserDetailResponse(fileDocument.getUploader(), fileMapper));
        }

        if (fileDocument.getFlaggedBy() != null) {
            response.setFlaggedBy(userDetailMapper.toUserDetailResponse(fileDocument.getFlaggedBy(), fileMapper));
        }

        if (fileDocument.getDeletedBy() != null) {
            response.setDeletedBy(userDetailMapper.toUserDetailResponse(fileDocument.getDeletedBy(), fileMapper));
        }

        return response;
    }

    private String determineResourceType(String fileExtension) {
        if (fileExtension == null) return "raw";

        String ext = fileExtension.toLowerCase();
        if (ext.matches("\\.(jpg|jpeg|png|gif|bmp|webp)")) {
            return "image";
        } else if (ext.matches("\\.(mp4|avi|mov|wmv|flv|webm|mkv)")) {
            return "video";
        } else if (ext.matches("\\.(mp3|wav|ogg|aac|flac)")) {
            return "audio";
        }
        return "raw";
    }

    private FileDocument getFileOrThrow(String id) {
        return fileRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
    }

    private void requireReason(FileActionRequest request, String actionName) {
        if (request == null || !StringUtils.hasText(request.getActionReason())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private void recordAudit(FileDocument fileDocument, FileActionType actionType, String reason, UserDetail actor) {
        FileAuditLog auditLog = FileAuditLog.builder()
                .fileId(fileDocument.getId())
                .action(actionType)
                .actionReason(reason)
                .actor(actor)
                .build();

        fileAuditLogRepository.save(auditLog);
    }

    private void validateSearchRequest(FileSearchRequest request) {
        if (request.getPage() == null || request.getPage() < 0) {
            request.setPage(0);
        }
        if (request.getSize() == null || request.getSize() <= 0) {
            request.setSize(20);
        } else if (request.getSize() > 100) {
            request.setSize(100);
        }

        if (request.getMinSize() != null && request.getMinSize() < 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if (request.getMaxSize() != null && request.getMaxSize() < 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if (request.getMinSize() != null && request.getMaxSize() != null
                && request.getMinSize() > request.getMaxSize()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if (request.getCreatedFrom() != null && request.getCreatedTo() != null
                && request.getCreatedFrom().isAfter(request.getCreatedTo())) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    private Pageable buildPageable(FileSearchRequest request) {
        Sort.Direction direction = request.getSortDirection() != null ? request.getSortDirection() : Sort.Direction.DESC;
        String sortField = resolveSortField(request.getSortBy());
        return PageRequest.of(request.getPage(), request.getSize(), Sort.by(direction, sortField));
    }

    private String resolveSortField(String sortBy) {
        if (!StringUtils.hasText(sortBy) || "createdAt".equalsIgnoreCase(sortBy)) {
            return "created_at";
        }
        if ("size".equalsIgnoreCase(sortBy)) {
            return "size";
        }
        if ("fileName".equalsIgnoreCase(sortBy)) {
            return "file_name";
        }
        throw new AppException(ErrorCode.INVALID_REQUEST);
    }

    private long aggregateTotalSize() {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.group().sum("size").as("totalSize")
        );
        AggregationResults<Document> results = mongoTemplate.aggregate(aggregation, FileDocument.class, Document.class);
        Document document = results.getUniqueMappedResult();
        if (document == null) {
            return 0L;
        }
        Number total = document.get("totalSize", Number.class);
        return total != null ? total.longValue() : 0L;
    }

    private String resolveUploaderId(FileSearchRequest request) {
        if (StringUtils.hasText(request.getUploaderId())) {
            return request.getUploaderId();
        }

        if (StringUtils.hasText(request.getUploaderUsername())) {
            return userRepository.findByUsername(request.getUploaderUsername())
                    .flatMap(userDetailRepository::findByUser)
                    .map(UserDetail::getId)
                    .orElse(null);
        }
        return null;
    }

    private FileListResponse buildEmptyListResponse(FileSearchRequest request) {
        Pageable pageable = buildPageable(request);
        Page<FileResponse> emptyPage = Page.empty(pageable);
        return FileListResponse.builder()
                .files(emptyPage)
                .message("No files match the search criteria")
                .totalElements(0)
                .totalPages(0)
                .currentPage(pageable.getPageNumber())
                .pageSize(pageable.getPageSize())
                .build();
    }

    private String formatBytes(long bytes) {
        if (bytes <= 0) {
            return "0 B";
        }
        final String[] units = new String[]{"B", "KB", "MB", "GB", "TB"};
        int digitGroups = (int) (Math.log10(bytes) / Math.log10(1024));
        digitGroups = Math.min(digitGroups, units.length - 1);
        return String.format("%.1f %s", bytes / Math.pow(1024, digitGroups), units[digitGroups]);
    }
}
