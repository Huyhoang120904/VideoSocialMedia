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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Tag(name = "Roles", description = "Role management endpoints - ADMIN only")
public class RoleController extends BaseController {

    RoleService roleService;


    @Operation(
            summary = "Get role by ID",
            description = "Retrieve a specific role by its ID. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Role retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Role not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{roleId}")
    public ResponseEntity<ApiResponse<RoleResponse>> getRoleById(
            @Parameter(description = "Role ID", required = true) @PathVariable String roleId) {
        return ok(roleService.findRoleById(roleId));
    }

    @Operation(
            summary = "Get all roles (paginated)",
            description = "Retrieve paginated list of all roles. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Roles retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    public ResponseEntity<ApiResponse<PagedModel<EntityModel<RoleResponse>>>> getRolesByPage(
            @Parameter(description = "Pagination parameters") @PageableDefault(size = 12, page = 0) Pageable pageable,
            PagedResourcesAssembler<RoleResponse> assembler) {
        return ok(assembler.toModel(roleService.findAllRolesByPage(pageable)));
    }

    @Operation(
            summary = "Create role",
            description = "Create a new role. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Role created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(@RequestBody RoleRequest request) {
        return created(roleService.createRole(request));
    }

    @Operation(
            summary = "Update role",
            description = "Update an existing role. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Role updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Role not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRole(
            @Parameter(description = "Role ID", required = true) @PathVariable String roleId,
            @RequestBody RoleRequest request) {
        return ok(roleService.updateRole(roleId, request));
    }

    @Operation(
            summary = "Delete role",
            description = "Delete a role by ID. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Role deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Role not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRole(
            @Parameter(description = "Role ID", required = true) @PathVariable String roleId) {
        roleService.deleteRole(roleId);
        return respond(HttpStatus.NO_CONTENT, "Role deleted successfully");
    }

    @Operation(
            summary = "Add permission to role",
            description = "Add a permission to a role. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Permission added to role successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Role or permission not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleResponse>> addPermissionToRole(
            @Parameter(description = "Role ID", required = true) @PathVariable String roleId,
            @Parameter(description = "Permission ID", required = true) @PathVariable String permissionId) {
        return ok(roleService.addPermissionToRole(roleId, permissionId));
    }

    @Operation(
            summary = "Remove permission from role",
            description = "Remove a permission from a role. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Permission removed from role successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Role or permission not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleResponse>> removePermissionFromRole(
            @Parameter(description = "Role ID", required = true) @PathVariable String roleId,
            @Parameter(description = "Permission ID", required = true) @PathVariable String permissionId) {
        return ok(roleService.removePermissionFromRole(roleId, permissionId));
    }
}
