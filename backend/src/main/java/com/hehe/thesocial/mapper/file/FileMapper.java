package com.hehe.thesocial.mapper.file;

import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.entity.FileDocument;
import com.hehe.thesocial.entity.Video;
import com.hehe.thesocial.entity.enums.FileType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface FileMapper {
    @Mapping(target = "fileType", source = "resourceType", qualifiedByName = "stringToFileType")
    @Mapping(target = "title", ignore = true)
    @Mapping(target = "description", ignore = true)
    FileResponse toFileResponse(FileDocument fileDocument);

    @Named("stringToFileType")
    default FileType stringToFileType(String resourceType) {
        if (resourceType == null) return null;
        
        switch (resourceType.toLowerCase()) {
            case "video":
                return FileType.VIDEO;
            case "image":
                return FileType.IMAGE;
            default:
                return null;
        }
    }

    // New method to map from Video entity including title and description
    default FileResponse toFileResponseFromVideo(Video video) {
        if (video == null || video.getVideo() == null) {
            return null;
        }
        
        FileDocument fileDocument = video.getVideo();
        FileResponse response = toFileResponse(fileDocument);
        response.setTitle(video.getTitle());
        response.setDescription(video.getDescription());
        return response;
    }
}
