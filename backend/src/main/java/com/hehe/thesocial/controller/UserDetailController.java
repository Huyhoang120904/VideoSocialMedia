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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/user-details")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserDetailController {
    UserDetailService userDetailService;

    // READ - Get current user's detail
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getMyDetail() {
        return ResponseEntity.ok(ApiResponse.<UserDetailResponse>builder()
                .result(userDetailService.getMyDetail())
                .build());
    }

    // READ - Get user detail by ID
    @GetMapping("/{userDetailId}")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getUserDetailById(@PathVariable String userDetailId) {
        return ResponseEntity.ok(ApiResponse.<UserDetailResponse>builder()
                .result(userDetailService.getUserDetailById(userDetailId))
                .build());
    }

    // READ - Get user detail by User ID
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getUserDetailByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.<UserDetailResponse>builder()
                .result(userDetailService.getUserDetailByUserId(userId))
                .build());
    }

    // READ - Get all user details
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDetailResponse>>> getAllUserDetails() {
        return ResponseEntity.ok(ApiResponse.<List<UserDetailResponse>>builder()
                .result(userDetailService.getAllUserDetails())
                .build());
    }

    // READ - Get paginated user details
    @GetMapping("/paginated")
    public ResponseEntity<ApiResponse<Page<UserDetailResponse>>> getUserDetailsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "displayName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(ApiResponse.<Page<UserDetailResponse>>builder()
                .result(userDetailService.getUserDetailsPaginated(pageable))
                .build());
    }

    // READ - Search user details by display name
    @GetMapping("/search/display-name")
    public ResponseEntity<ApiResponse<List<UserDetailResponse>>> searchByDisplayName(
            @RequestParam String displayName) {
        return ResponseEntity.ok(ApiResponse.<List<UserDetailResponse>>builder()
                .result(userDetailService.searchUserDetailsByDisplayName(displayName))
                .build());
    }

    // READ - Search user details by username
    @GetMapping("/search/username")
    public ResponseEntity<ApiResponse<List<UserDetailResponse>>> searchByUsername(
            @RequestParam String username) {
        return ResponseEntity.ok(ApiResponse.<List<UserDetailResponse>>builder()
                .result(userDetailService.searchUserDetailsByUsername(username))
                .build());
    }

    // UPDATE - Update user detail
    @PutMapping(value = "/{userDetailId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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

        return ResponseEntity.ok(ApiResponse.<UserDetailResponse>builder()
                .result(userDetailService.updateUserDetail(userDetailId, request))
                .build());
    }

    // UPDATE - Update avatar only
    @PatchMapping(value = "/{userDetailId}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserDetailResponse>> updateAvatar(
            @PathVariable String userDetailId,
            @RequestParam(name = "avatar") MultipartFile avatar) {

        UserDetailUpdateRequest request = UserDetailUpdateRequest.builder()
                .avatar(avatar)
                .build();

        return ResponseEntity.ok(ApiResponse.<UserDetailResponse>builder()
                .result(userDetailService.updateUserDetail(userDetailId, request))
                .build());
    }

    // DELETE - Delete user detail
    @DeleteMapping("/{userDetailId}")
    public ResponseEntity<ApiResponse<Void>> deleteUserDetail(@PathVariable String userDetailId) {
        userDetailService.deleteUserDetail(userDetailId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.<Void>builder()
                .message("User detail deleted successfully")
                .build());
    }

    // SOCIAL - Follow a user
    @PostMapping("/follow/{targetUserDetailId}")
    public ResponseEntity<ApiResponse<UserDetailResponse>> followUser(@PathVariable String targetUserDetailId) {
        return ResponseEntity.ok(ApiResponse.<UserDetailResponse>builder()
                .result(userDetailService.followUser(targetUserDetailId))
                .build());
    }

    // SOCIAL - Unfollow a user
    @DeleteMapping("/unfollow/{targetUserDetailId}")
    public ResponseEntity<ApiResponse<UserDetailResponse>> unfollowUser(@PathVariable String targetUserDetailId) {
        return ResponseEntity.ok(ApiResponse.<UserDetailResponse>builder()
                .result(userDetailService.unfollowUser(targetUserDetailId))
                .build());
    }

    // SOCIAL - Get followers
    @GetMapping("/{userDetailId}/followers")
    public ResponseEntity<ApiResponse<List<UserDetailResponse>>> getFollowers(@PathVariable String userDetailId) {
        return ResponseEntity.ok(ApiResponse.<List<UserDetailResponse>>builder()
                .result(userDetailService.getFollowers(userDetailId))
                .build());
    }

    // SOCIAL - Get following
    @GetMapping("/{userDetailId}/following")
    public ResponseEntity<ApiResponse<List<UserDetailResponse>>> getFollowing(@PathVariable String userDetailId) {
        return ResponseEntity.ok(ApiResponse.<List<UserDetailResponse>>builder()
                .result(userDetailService.getFollowing(userDetailId))
                .build());
    }

    // SOCIAL - Check if following
    @GetMapping("/{userDetailId}/is-following/{targetUserDetailId}")
    public ResponseEntity<ApiResponse<Boolean>> isFollowing(
            @PathVariable String userDetailId,
            @PathVariable String targetUserDetailId) {
        return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                .result(userDetailService.isFollowing(userDetailId, targetUserDetailId))
                .build());
    }
}
