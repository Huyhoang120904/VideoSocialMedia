package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.permission.PermissionRequest;
import com.hehe.thesocial.dto.response.permission.PermissionResponse;
import com.hehe.thesocial.service.permission.PermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class PermissionController {
    PermissionService permissionService;

    @GetMapping("/{permissionId}")
    public ApiResponse<PermissionResponse> getPermissionById(@PathVariable String permissionId) {
        return ApiResponse.<PermissionResponse>builder()
                .result(permissionService.findPermissionById(permissionId))
                .build();
    }

    @GetMapping
    public ApiResponse<PagedModel<EntityModel<PermissionResponse>>> getPermissionsByPage(
            @PageableDefault(size = 12, page = 0) Pageable pageable,  PagedResourcesAssembler<PermissionResponse> assembler) {
        return ApiResponse.<PagedModel<EntityModel<PermissionResponse>>>builder()
                .result(assembler.toModel(permissionService.findAllPermissionsByPage(pageable)))
                .build();
    }

    @PostMapping
    public ApiResponse<PermissionResponse> createPermission(@RequestBody PermissionRequest request) {
        return ApiResponse.<PermissionResponse>builder()
                .result(permissionService.createPermission(request))
                .build();
    }

    @PutMapping("/{permissionId}")
    public ApiResponse<PermissionResponse> updatePermission(
            @PathVariable String permissionId,
            @RequestBody PermissionRequest request) {
        return ApiResponse.<PermissionResponse>builder()
                .result(permissionService.updatePermission(permissionId, request))
                .build();
    }

    @DeleteMapping("/{permissionId}")
    public ApiResponse<Void> deletePermission(@PathVariable String permissionId) {
        permissionService.deletePermission(permissionId);
        return ApiResponse.<Void>builder()
                .message("Permission deleted successfully")
                .build();
    }
}
