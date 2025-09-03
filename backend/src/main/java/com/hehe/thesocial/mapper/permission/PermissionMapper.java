package com.hehe.thesocial.mapper.permission;

import com.hehe.thesocial.dto.request.permission.PermissionRequest;
import com.hehe.thesocial.dto.response.permission.PermissionResponse;
import com.hehe.thesocial.entity.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {

    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}
