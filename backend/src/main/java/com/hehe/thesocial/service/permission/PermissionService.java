package com.hehe.thesocial.service.permission;

import com.hehe.thesocial.dto.request.permission.PermissionRequest;
import com.hehe.thesocial.dto.response.permission.PermissionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

public interface PermissionService {
    Page<PermissionResponse> findAllPermissionsByPage(Pageable pageable);

    PermissionResponse findPermissionById(String id);

    @Transactional
    PermissionResponse createPermission(PermissionRequest permission);

    @Transactional
    PermissionResponse updatePermission(String id, PermissionRequest permission);

    @Transactional
    void deletePermission(String id);
}
