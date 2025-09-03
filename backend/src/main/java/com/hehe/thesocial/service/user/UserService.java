package com.hehe.thesocial.service.user;

import com.hehe.thesocial.dto.request.user.RegisterRequest;
import com.hehe.thesocial.dto.request.user.UserUpdateRequest;
import com.hehe.thesocial.dto.response.user.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

public interface UserService {
    Page<UserResponse> findAllUserBypage(Pageable pageable);

    UserResponse findUserById(String id);

    @Transactional
    UserResponse register(RegisterRequest request);

    @Transactional
    UserResponse updateUser(UserUpdateRequest userUpdateRequest);

    @Transactional
    void deleteUser(String id);
}
