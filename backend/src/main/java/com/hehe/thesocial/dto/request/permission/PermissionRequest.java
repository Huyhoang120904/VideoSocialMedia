package com.hehe.thesocial.dto.request.permission;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PermissionRequest {
    String permission;
    String description;
}
