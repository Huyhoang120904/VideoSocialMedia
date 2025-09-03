package com.hehe.thesocial.dto.response.file;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hehe.thesocial.entity.enums.FileType;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FileResponse {
    String fileName;
    FileType fileType;
    Long size;
    String url;
    String format;
    int width;
    int height;
    String etag;
}
