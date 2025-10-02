package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.request.userDetail.UserDetailUpdateRequest;
import com.hehe.thesocial.dto.response.userDetail.UserDetailResponse;
import com.hehe.thesocial.service.userDetail.UserDetailService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/user-details")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserDetailController {
    UserDetailService userDetailService;

    @GetMapping("/me")
    public ApiResponse<UserDetailResponse> getMyDetail() {
        return ApiResponse.<UserDetailResponse>builder()
                .result(userDetailService.getMyDetail())
                .build();
    }

    @PostMapping(value = "/{userDetailId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserDetailResponse> updateUserDetail(
            @PathVariable String userDetailId,
            @RequestParam(name = "displayName", required = false) String displayName,
            @RequestParam(name = "bio", required = false) String bio,
            @RequestParam(name = "shownName", required = false) String shownName,
            @RequestParam(name = "avatar", required = false) MultipartFile avatar) {

        UserDetailUpdateRequest request1 = UserDetailUpdateRequest.builder()
                .avatar(avatar)
                .displayName(displayName)
                .bio(bio)
                .shownName(shownName)
                .build();

        return ApiResponse.<UserDetailResponse>builder()
                .result(userDetailService.updateUserDetail(userDetailId, request1))
                .build();
    }
}
