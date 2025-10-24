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
    public ApiResponse<UserDetailResponse> getMyDetail() {
        return ApiResponse.<UserDetailResponse>builder()
                .result(userDetailService.getMyDetail())
                .build();
    }

    // READ - Get user detail by ID
    @GetMapping("/{userDetailId}")
    public ApiResponse<UserDetailResponse> getUserDetailById(@PathVariable String userDetailId) {
        return ApiResponse.<UserDetailResponse>builder()
                .result(userDetailService.getUserDetailById(userDetailId))
                .build();
    }

    // READ - Get user detail by User ID
    @GetMapping("/by-user/{userId}")
    public ApiResponse<UserDetailResponse> getUserDetailByUserId(@PathVariable String userId) {
        return ApiResponse.<UserDetailResponse>builder()
                .result(userDetailService.getUserDetailByUserId(userId))
                .build();
    }

    // READ - Get all user details
    @GetMapping
    public ApiResponse<List<UserDetailResponse>> getAllUserDetails() {
        return ApiResponse.<List<UserDetailResponse>>builder()
                .result(userDetailService.getAllUserDetails())
                .build();
    }

    // READ - Get paginated user details
    @GetMapping("/paginated")
    public ApiResponse<Page<UserDetailResponse>> getUserDetailsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "displayName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ApiResponse.<Page<UserDetailResponse>>builder()
                .result(userDetailService.getUserDetailsPaginated(pageable))
                .build();
    }

    // READ - Search user details by display name
    @GetMapping("/search/display-name")
    public ApiResponse<List<UserDetailResponse>> searchByDisplayName(
            @RequestParam String displayName) {
        return ApiResponse.<List<UserDetailResponse>>builder()
                .result(userDetailService.searchUserDetailsByDisplayName(displayName))
                .build();
    }

    // READ - Search user details by username
    @GetMapping("/search/username")
    public ApiResponse<List<UserDetailResponse>> searchByUsername(
            @RequestParam String username) {
        return ApiResponse.<List<UserDetailResponse>>builder()
                .result(userDetailService.searchUserDetailsByUsername(username))
                .build();
    }

    // UPDATE - Update user detail
    @PutMapping(value = "/{userDetailId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserDetailResponse> updateUserDetail(
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

        return ApiResponse.<UserDetailResponse>builder()
                .result(userDetailService.updateUserDetail(userDetailId, request))
                .build();
    }

    // UPDATE - Update avatar only
    @PatchMapping(value = "/{userDetailId}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserDetailResponse> updateAvatar(
            @PathVariable String userDetailId,
            @RequestParam(name = "avatar") MultipartFile avatar) {

        UserDetailUpdateRequest request = UserDetailUpdateRequest.builder()
                .avatar(avatar)
                .build();

        return ApiResponse.<UserDetailResponse>builder()
                .result(userDetailService.updateUserDetail(userDetailId, request))
                .build();
    }

    // DELETE - Delete user detail
    @DeleteMapping("/{userDetailId}")
    public ResponseEntity<ApiResponse<Void>> deleteUserDetail(@PathVariable String userDetailId) {
        userDetailService.deleteUserDetail(userDetailId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("User detail deleted successfully")
                .build());
    }

    // SOCIAL - Follow a user
    @PostMapping("/follow/{targetUserDetailId}")
    public ApiResponse<UserDetailResponse> followUser(@PathVariable String targetUserDetailId) {
        return ApiResponse.<UserDetailResponse>builder()
                .result(userDetailService.followUser(targetUserDetailId))
                .build();
    }

    // SOCIAL - Unfollow a user
    @DeleteMapping("/unfollow/{targetUserDetailId}")
    public ApiResponse<UserDetailResponse> unfollowUser(@PathVariable String targetUserDetailId) {
        return ApiResponse.<UserDetailResponse>builder()
                .result(userDetailService.unfollowUser(targetUserDetailId))
                .build();
    }

    // SOCIAL - Get followers
    @GetMapping("/{userDetailId}/followers")
    public ApiResponse<List<UserDetailResponse>> getFollowers(@PathVariable String userDetailId) {
        return ApiResponse.<List<UserDetailResponse>>builder()
                .result(userDetailService.getFollowers(userDetailId))
                .build();
    }

    // SOCIAL - Get following
    @GetMapping("/{userDetailId}/following")
    public ApiResponse<List<UserDetailResponse>> getFollowing(@PathVariable String userDetailId) {
        return ApiResponse.<List<UserDetailResponse>>builder()
                .result(userDetailService.getFollowing(userDetailId))
                .build();
    }

    // SOCIAL - Check if following
    @GetMapping("/{userDetailId}/is-following/{targetUserDetailId}")
    public ApiResponse<Boolean> isFollowing(
            @PathVariable String userDetailId,
            @PathVariable String targetUserDetailId) {
        return ApiResponse.<Boolean>builder()
                .result(userDetailService.isFollowing(userDetailId, targetUserDetailId))
                .build();
    }
}
