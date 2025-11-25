package com.hehe.thesocial.mapper.file;

import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.entity.FileDocument;
import com.hehe.thesocial.entity.enums.FileType;
import com.hehe.thesocial.mapper.userDetail.UserDetailMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface FileMapper {
    @Mapping(target = "fileType", source = "resourceType", qualifiedByName = "stringToFileType")
    @Mapping(target = "uploader", ignore = true)
    @Mapping(target = "flaggedBy", ignore = true)
    @Mapping(target = "deletedBy", ignore = true)
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
