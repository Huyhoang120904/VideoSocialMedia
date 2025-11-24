package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.userInteraction.UserInteractionRequest;
import com.hehe.thesocial.dto.response.userInteraction.UserInteractionResponse;
import com.hehe.thesocial.service.userInteractions.UserInteractionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user-interactions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@Tag(name = "User Interactions", description = "User interaction tracking endpoints - requires authentication")
public class UserInteractionController extends BaseController {
    UserInteractionService userInteractionService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> saveInteractions(@RequestBody List<UserInteractionRequest> batch){
        userInteractionService.batchSaveUserInteraction(batch);

        return okMessage("User interactions saved successfully");
    }

    @Operation(
            summary = "Get user interactions (paginated)",
            description = "Retrieve paginated user interactions for admin dashboards. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Interactions retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserInteractionResponse>>> getUserInteractions(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ok(userInteractionService.getUserInteractions(pageable));
    }

    @Operation(
            summary = "Get user interactions by user",
            description = "Retrieve paginated interactions for a specific user detail ID. Requires ADMIN role."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Interactions retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied - requires ADMIN role")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/user/{userDetailId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserInteractionResponse>>> getUserInteractionsByUser(
            @PathVariable String userDetailId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ok(userInteractionService.getUserInteractionsByUser(userDetailId, pageable));
    }
}
