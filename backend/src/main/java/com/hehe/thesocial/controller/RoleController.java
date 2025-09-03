package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.role.RoleRequest;
import com.hehe.thesocial.dto.response.role.RoleResponse;
import com.hehe.thesocial.service.role.RoleService;
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
@RequestMapping("/roles")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class RoleController {

    RoleService roleService;


    @GetMapping("/{roleId}")
    public ApiResponse<RoleResponse> getRoleById(@PathVariable String roleId) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.findRoleById(roleId))
                .build();
    }

    @GetMapping
    public ApiResponse<PagedModel<EntityModel<RoleResponse>>> getRolesByPage(
            @PageableDefault(size = 12, page = 0) Pageable pageable,  PagedResourcesAssembler<RoleResponse> assembler) {
        return ApiResponse.<PagedModel<EntityModel<RoleResponse>>>builder()
                .result(assembler.toModel(roleService.findAllRolesByPage(pageable)))
                .build();
    }

    @PostMapping
    public ApiResponse<RoleResponse> createRole(@RequestBody RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.createRole(request))
                .build();
    }

    @PutMapping("/{roleId}")
    public ApiResponse<RoleResponse> updateRole(
            @PathVariable String roleId,
            @RequestBody RoleRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.updateRole(roleId, request))
                .build();
    }

    @DeleteMapping("/{roleId}")
    public ApiResponse<Void> deleteRole(@PathVariable String roleId) {
        roleService.deleteRole(roleId);
        return ApiResponse.<Void>builder()
                .message("Role deleted successfully")
                .build();
    }

    @PostMapping("/{roleId}/permissions/{permissionId}")
    public ApiResponse<RoleResponse> addPermissionToRole(
            @PathVariable String roleId,
            @PathVariable String permissionId) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.addPermissionToRole(roleId, permissionId))
                .build();
    }

    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    public ApiResponse<RoleResponse> removePermissionFromRole(
            @PathVariable String roleId,
            @PathVariable String permissionId) {
        return ApiResponse.<RoleResponse>builder()
                .result(roleService.removePermissionFromRole(roleId, permissionId))
                .build();
    }
}
