package com.hehe.thesocial.mapper.role;

import com.hehe.thesocial.dto.request.role.RoleRequest;
import com.hehe.thesocial.dto.response.role.RoleResponse;
import com.hehe.thesocial.mapper.permission.PermissionMapper;
import com.hehe.thesocial.entity.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {
        PermissionMapper.class
})
public interface RoleMapper {
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
