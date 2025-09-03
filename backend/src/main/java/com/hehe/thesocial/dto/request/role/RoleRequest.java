package com.hehe.thesocial.dto.request.role;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleRequest {
    String roleName;
    String description;
}
