package com.hehe.thesocial.mapper.file;

import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.entity.FileDocument;
import com.hehe.thesocial.entity.enums.FileType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface FileMapper {
    @Mapping(target = "fileType", source = "resourceType", qualifiedByName = "stringToFileType")
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
}
