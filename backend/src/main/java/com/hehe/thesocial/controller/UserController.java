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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class UserController {
    UserService userService;

    @GetMapping("/{userId}")
    public ApiResponse<UserResponse> getUserById(@PathVariable String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.findUserById(userId))
                .build();
    }

    @GetMapping
    public ApiResponse<PagedModel<EntityModel<UserResponse>>> getUserByPage(@PageableDefault(size = 12, page = 0) Pageable pageable,
                                                                            PagedResourcesAssembler<UserResponse> assembler) {
        return ApiResponse.<PagedModel<EntityModel<UserResponse>>>builder()
                .result(assembler.toModel(userService.findAllUserBypage(pageable)))
                .build();
    }

    @PostMapping()
    public ApiResponse<UserResponse> register(@RequestBody RegisterRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.register(request))
                .build();
    }

    @PutMapping("/{userId}")
    public ApiResponse<UserResponse> updateUser(@RequestBody UserUpdateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUser(request))
                .build();
    }

    @DeleteMapping("/{userId}")
    public ApiResponse<Void> deleteUserById(@PathVariable String userId) {

        userService.deleteUser(userId);

        return ApiResponse.<Void>builder()
                .build();
    }
}
