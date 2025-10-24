package com.hehe.thesocial.mapper.file;

import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.entity.FileDocument;
import com.hehe.thesocial.entity.enums.FileType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface FileMapper {

    @Mapping(source = "resourceType", target = "fileType", qualifiedByName = "mapResourceTypeToFileType")
    FileResponse toFileResponse(FileDocument fileDocument);

    @Named("mapResourceTypeToFileType")
    default FileType mapResourceTypeToFileType(String resourceType) {
        if (resourceType == null) {
            return null;
        }

        return switch (resourceType.toLowerCase()) {
            case "video" -> FileType.VIDEO;
            case "image" -> FileType.IMAGE;
            case "thumbnail" -> FileType.THUMBNAIL;
            case "profile_image", "pfp" -> FileType.PROFILE_IMAGE;
            default -> null;
        };
    }
}
