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
@RequestMapping("/permissions")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Tag(name = "Permissions", description = "Permission management endpoints - ADMIN only")
public class PermissionController {
    PermissionService permissionService;

    @Operation(
            summary = "Get permission by ID",
            description = "Retrieve a specific permission by its ID. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Permission retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Permission not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{permissionId}")
    public ResponseEntity<ApiResponse<PermissionResponse>> getPermissionById(
            @Parameter(description = "Permission ID", required = true) @PathVariable String permissionId) {
        return ResponseEntity.ok(ApiResponse.<PermissionResponse>builder()
                .result(permissionService.findPermissionById(permissionId))
                .build());
    }

    @Operation(
            summary = "Get all permissions (paginated)",
            description = "Retrieve paginated list of all permissions. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Permissions retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    public ResponseEntity<ApiResponse<PagedModel<EntityModel<PermissionResponse>>>> getPermissionsByPage(
            @Parameter(description = "Pagination parameters") @PageableDefault(size = 12, page = 0) Pageable pageable,
            PagedResourcesAssembler<PermissionResponse> assembler) {
        return ResponseEntity.ok(ApiResponse.<PagedModel<EntityModel<PermissionResponse>>>builder()
                .result(assembler.toModel(permissionService.findAllPermissionsByPage(pageable)))
                .build());
    }

    @Operation(
            summary = "Create permission",
            description = "Create a new permission. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Permission created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PermissionResponse>> createPermission(@RequestBody PermissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<PermissionResponse>builder()
                .result(permissionService.createPermission(request))
                .build());
    }

    @Operation(
            summary = "Update permission",
            description = "Update an existing permission. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Permission updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Permission not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{permissionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PermissionResponse>> updatePermission(
            @Parameter(description = "Permission ID", required = true) @PathVariable String permissionId,
            @RequestBody PermissionRequest request) {
        return ResponseEntity.ok(ApiResponse.<PermissionResponse>builder()
                .result(permissionService.updatePermission(permissionId, request))
                .build());
    }

    @Operation(
            summary = "Delete permission",
            description = "Delete a permission by ID. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Permission deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Permission not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{permissionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePermission(
            @Parameter(description = "Permission ID", required = true) @PathVariable String permissionId) {
        permissionService.deletePermission(permissionId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.<Void>builder()
                .message("Permission deleted successfully")
                .build());
    }
}
