package com.hehe.thesocial.dto.response.role;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hehe.thesocial.dto.response.permission.PermissionResponse;
import com.hehe.thesocial.entity.Permission;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoleResponse {
    String id;
    String roleName;
    String description;

    List<PermissionResponse> permissions;
}
