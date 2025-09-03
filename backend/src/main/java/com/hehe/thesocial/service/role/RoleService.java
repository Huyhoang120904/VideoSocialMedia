package com.hehe.thesocial.service.role;

import com.hehe.thesocial.dto.request.role.RoleRequest;
import com.hehe.thesocial.dto.response.role.RoleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

public interface RoleService {
    Page<RoleResponse> findAllRolesByPage(Pageable pageable);

    RoleResponse findRoleById(String id);

    @Transactional
    RoleResponse createRole(RoleRequest request);

    @Transactional
    RoleResponse updateRole(String id, RoleRequest request);

    @Transactional
    void deleteRole(String id);

    @Transactional
    RoleResponse addPermissionToRole(String roleId, String permissionId);

    @Transactional
    RoleResponse removePermissionFromRole(String roleId, String permissionId);
}
