package com.hehe.thesocial.dto.response.notification;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hehe.thesocial.dto.response.file.FileResponse;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationActorResponse {
    String id;
    String displayName;
    String shownName;
    FileResponse avatar;
}






