package com.hehe.thesocial.service.user;

import com.hehe.thesocial.constant.PredefinedRoles;
import com.hehe.thesocial.dto.request.user.RegisterRequest;
import com.hehe.thesocial.dto.request.user.UserUpdateRequest;
import com.hehe.thesocial.dto.response.user.UserResponse;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.mapper.user.UserMapper;
import com.hehe.thesocial.entity.Role;
import com.hehe.thesocial.entity.User;
import com.hehe.thesocial.repository.RoleRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class UserServiceImpl implements UserService {
    UserMapper userMapper;
    UserRepository userRepository;
    UserDetailRepository userDetailRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;

    @Override
    public Page<UserResponse> findAllUserBypage(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return users.map(userMapper::toUserResponse);
    }

    @Override
    public UserResponse findUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toUserResponse(user);
    }

    @Transactional
    @Override
    public UserResponse register(RegisterRequest request) {
        User user = userMapper.toUser(request);
        Role userRole = roleRepository.findByRoleName(PredefinedRoles.USER_ROLE).
                orElseGet(() ->
                        roleRepository.save(Role.builder()
                                .roleName(PredefinedRoles.USER_ROLE)
                                .build())
                );
        user.setRoles(new HashSet<>(List.of(userRole)));
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user = userRepository.save(user);

        //Create user detail when registering
        UserDetail userDetail = UserDetail.builder()
                .user(user)
                .displayName(user.getUsername())
                .shownName("@"+user.getUsername())
                .build();

        userDetail = userDetailRepository.save(userDetail);
        userDetailRepository.findById(userDetail.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNCATEGORIZED));
        return userMapper.toUserResponse(user);
    }

    @Transactional
    @Override
    public UserResponse updateUser(UserUpdateRequest userUpdateRequest) {
        User user = userRepository.findByUsername(userUpdateRequest.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setPassword(userUpdateRequest.getPassword());
        user.setMail(userUpdateRequest.getMail());
        user = userRepository.save(user);
        return userMapper.toUserResponse(user);
    }

    @Transactional
    @Override
    public void deleteUser(String id) {
        if (userRepository.existsById(id)) {
            throw new RuntimeException(new AppException(ErrorCode.USER_NOT_FOUND));
        }
        userRepository.deleteById(id);
    }


}
