package com.hehe.thesocial.mapper.file;

import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.entity.FileDocument;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FileMapper {
    FileResponse toFileResponse(FileDocument fileDocument);
}
