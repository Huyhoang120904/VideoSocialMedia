package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.userDetail.UserDetailUpdateRequest;
import com.hehe.thesocial.dto.response.userDetail.UserDetailResponse;
import com.hehe.thesocial.service.userDetail.UserDetailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/user-details")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "User Details", description = "User profile and social interaction endpoints")
public class UserDetailController extends BaseController {
    UserDetailService userDetailService;

    // READ - Get current user's detail
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getMyDetail() {
        return ok(userDetailService.getMyDetail());
    }

    // READ - Get user detail by ID
    @GetMapping("/{userDetailId}")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getUserDetailById(@PathVariable String userDetailId) {
        return ok(userDetailService.getUserDetailById(userDetailId));
    }

    // READ - Get user detail by User ID
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getUserDetailByUserId(@PathVariable String userId) {
        return ok(userDetailService.getUserDetailByUserId(userId));
    }

    // READ - Get all user details
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDetailResponse>>> getAllUserDetails() {
        return ok(userDetailService.getAllUserDetails());
    }

    // READ - Get paginated user details
    @GetMapping("/paginated")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserDetailResponse>>> getUserDetailsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "displayName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ok(userDetailService.getUserDetailsPaginated(pageable));
    }

    // READ - Search user details by display name
    @GetMapping("/search/display-name")
    public ResponseEntity<ApiResponse<List<UserDetailResponse>>> searchByDisplayName(
            @RequestParam String displayName) {
        return ok(userDetailService.searchUserDetailsByDisplayName(displayName));
    }

    // READ - Search user details by username
    @GetMapping("/search/username")
    public ResponseEntity<ApiResponse<List<UserDetailResponse>>> searchByUsername(
            @RequestParam String username) {
        return ok(userDetailService.searchUserDetailsByUsername(username));
    }

    // UPDATE - Update user detail
    @PutMapping(value = "/{userDetailId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDetailResponse>> updateUserDetail(
            @PathVariable String userDetailId,
            @RequestParam(name = "displayName", required = false) String displayName,
            @RequestParam(name = "bio", required = false) String bio,
            @RequestParam(name = "shownName", required = false) String shownName,
            @RequestParam(name = "avatar", required = false) MultipartFile avatar) {

        UserDetailUpdateRequest request = UserDetailUpdateRequest.builder()
                .avatar(avatar)
                .displayName(displayName)
                .bio(bio)
                .shownName(shownName)
                .build();

        return ok(userDetailService.updateUserDetail(userDetailId, request));
    }

    // UPDATE - Update avatar only
    @PatchMapping(value = "/{userDetailId}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDetailResponse>> updateAvatar(
            @PathVariable String userDetailId,
            @RequestParam(name = "avatar") MultipartFile avatar) {

        UserDetailUpdateRequest request = UserDetailUpdateRequest.builder()
                .avatar(avatar)
                .build();

        return ok(userDetailService.updateUserDetail(userDetailId, request));
    }

    // DELETE - Delete user detail
    @DeleteMapping("/{userDetailId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUserDetail(@PathVariable String userDetailId) {
        userDetailService.deleteUserDetail(userDetailId);
        return respond(HttpStatus.NO_CONTENT, "User detail deleted successfully");
    }

    // SOCIAL - Follow a user
    @PostMapping("/follow/{targetUserDetailId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDetailResponse>> followUser(@PathVariable String targetUserDetailId) {
        return ok(userDetailService.followUser(targetUserDetailId));
    }

    // SOCIAL - Unfollow a user
    @DeleteMapping("/unfollow/{targetUserDetailId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDetailResponse>> unfollowUser(@PathVariable String targetUserDetailId) {
        return ok(userDetailService.unfollowUser(targetUserDetailId));
    }

    // SOCIAL - Get followers
    @GetMapping("/{userDetailId}/followers")
    public ResponseEntity<ApiResponse<List<UserDetailResponse>>> getFollowers(@PathVariable String userDetailId) {
        return ok(userDetailService.getFollowers(userDetailId));
    }

    // SOCIAL - Get following
    @GetMapping("/{userDetailId}/following")
    public ResponseEntity<ApiResponse<List<UserDetailResponse>>> getFollowing(@PathVariable String userDetailId) {
        return ok(userDetailService.getFollowing(userDetailId));
    }

    // SOCIAL - Check if following
    @GetMapping("/{userDetailId}/is-following/{targetUserDetailId}")
    public ResponseEntity<ApiResponse<Boolean>> isFollowing(
            @PathVariable String userDetailId,
            @PathVariable String targetUserDetailId) {
        return ok(userDetailService.isFollowing(userDetailId, targetUserDetailId));
    }
}
