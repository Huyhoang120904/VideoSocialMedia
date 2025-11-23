package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.user.RegisterRequest;
import com.hehe.thesocial.dto.request.user.UserUpdateRequest;
import com.hehe.thesocial.dto.response.user.UserResponse;
import com.hehe.thesocial.service.user.UserService;
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
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Tag(name = "Users", description = "User management endpoints")
public class UserController {
    UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .result(userService.findUserById(userId))
                .build());
    }

    @Operation(
            summary = "Get all users (paginated)",
            description = "Retrieve paginated list of all users. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Users retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedModel<EntityModel<UserResponse>>>> getUserByPage(
            @Parameter(description = "Pagination parameters") @PageableDefault(size = 12, page = 0) Pageable pageable,
            PagedResourcesAssembler<UserResponse> assembler) {
        return ResponseEntity.ok(ApiResponse.<PagedModel<EntityModel<UserResponse>>>builder()
                .result(assembler.toModel(userService.findAllUserBypage(pageable)))
                .build());
    }

    @PostMapping()
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<UserResponse>builder()
                .result(userService.register(request))
                .build());
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .result(userService.updateUser(request))
                .build());
    }

    @Operation(
            summary = "Delete user",
            description = "Delete a user by ID. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "User deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUserById(
            @Parameter(description = "User ID", required = true) @PathVariable String userId) {

        userService.deleteUser(userId);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.<Void>builder()
                .message("User deleted successfully")
                .build());
    }
}
