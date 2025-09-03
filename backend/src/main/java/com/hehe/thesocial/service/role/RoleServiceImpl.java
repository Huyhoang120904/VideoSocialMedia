package com.hehe.thesocial.service.role;

import com.hehe.thesocial.dto.request.role.RoleRequest;
import com.hehe.thesocial.dto.response.role.RoleResponse;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.mapper.role.RoleMapper;
import com.hehe.thesocial.entity.Permission;
import com.hehe.thesocial.entity.Role;
import com.hehe.thesocial.repository.PermissionRepository;
import com.hehe.thesocial.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    RoleRepository roleRepository;
    PermissionRepository permissionRepository;
    RoleMapper roleMapper;

    @Override
    public Page<RoleResponse> findAllRolesByPage(Pageable pageable) {
        Page<Role> roles = roleRepository.findAll(pageable);
        return roles.map(roleMapper::toRoleResponse);
    }

    @Override
    public RoleResponse findRoleById(String id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return roleMapper.toRoleResponse(role);
    }

    @Transactional
    @Override
    public RoleResponse createRole(RoleRequest request) {
        Role role = roleMapper.toRole(request);
        role = roleRepository.save(role);
        return roleMapper.toRoleResponse(role);
    }

    @Transactional
    @Override
    public RoleResponse updateRole(String id, RoleRequest request) {
        if (!roleRepository.existsById(id)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        Role role = roleMapper.toRole(request);
        role.setId(id); // Ensure we're updating the correct role
        role = roleRepository.save(role);

        return roleMapper.toRoleResponse(role);
    }

    @Transactional
    @Override
    public void deleteRole(String id) {
        if (!roleRepository.existsById(id)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        roleRepository.deleteById(id);
    }

    @Transactional
    @Override
    public RoleResponse addPermissionToRole(String roleId, String permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        role.getPermissions().add(permission);
        role = roleRepository.save(role);

        return roleMapper.toRoleResponse(role);
    }

    @Transactional
    @Override
    public RoleResponse removePermissionFromRole(String roleId, String permissionId) {
        // First check if both role and permission exist
        if (!roleRepository.existsById(roleId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        if (!permissionRepository.existsById(permissionId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        // Get the permission object first (we need this to remove from the collection)
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Get the role, update it and return the updated entity
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        role.getPermissions().remove(permission);
        role = roleRepository.save(role);

        return roleMapper.toRoleResponse(role);
    }
}
