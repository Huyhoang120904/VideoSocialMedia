package com.hehe.thesocial.service.permission;

import com.hehe.thesocial.dto.request.permission.PermissionRequest;
import com.hehe.thesocial.dto.response.permission.PermissionResponse;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.mapper.permission.PermissionMapper;
import com.hehe.thesocial.entity.Permission;
import com.hehe.thesocial.repository.PermissionRepository;
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
public class PermissionServiceImpl implements PermissionService {

    PermissionRepository permissionRepository;
    PermissionMapper permissionMapper;

    @Override
    public Page<PermissionResponse> findAllPermissionsByPage(Pageable pageable) {
        Page<Permission> permissions = permissionRepository.findAll(pageable);
        return permissions.map(permissionMapper::toPermissionResponse);
    }

    @Override
    public PermissionResponse findPermissionById(String id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return permissionMapper.toPermissionResponse(permission);
    }

    @Transactional
    @Override
    public PermissionResponse createPermission(PermissionRequest request) {
        Permission permission = permissionMapper.toPermission(request);
        permission = permissionRepository.save(permission);
        return permissionMapper.toPermissionResponse(permission);
    }

    @Transactional
    @Override
    public PermissionResponse updatePermission(String id, PermissionRequest request) {
        if (!permissionRepository.existsById(id)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        Permission permission = permissionMapper.toPermission(request);
        permission.setId(id); // Ensure we're updating the correct permission
        permission = permissionRepository.save(permission);

        return permissionMapper.toPermissionResponse(permission);
    }

    @Transactional
    @Override
    public void deletePermission(String id) {
        if (!permissionRepository.existsById(id)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        permissionRepository.deleteById(id);
    }
}
