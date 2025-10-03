package com.hehe.thesocial.service.userDetail;

import com.hehe.thesocial.dto.request.userDetail.UserDetailUpdateRequest;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.dto.response.userDetail.UserDetailResponse;
import com.hehe.thesocial.entity.FileDocument;
import com.hehe.thesocial.entity.User;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.mapper.userDetail.UserDetailMapper;
import com.hehe.thesocial.repository.FileRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.repository.UserRepository;
import com.hehe.thesocial.service.file.FileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserDetailServiceImpl implements UserDetailService {
    UserDetailRepository userDetailRepository;
    UserDetailMapper userDetailMapper;
    FileService fileService;
    FileRepository fileRepository;
    UserRepository userRepository;

    @Override
    public UserDetailResponse getMyDetail() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("User ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        UserDetail userDetail = userDetailRepository.findByUser(user)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        return userDetailMapper.toUserDetailResponse(userDetail);
    }

    @Transactional
    @Override
    public UserDetailResponse updateUserDetail(String userDetailId, UserDetailUpdateRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDetail userDetail = userDetailRepository.findByUser(User.builder()
                        .id(userId)
                        .build())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        if (!userDetail.getId().equals(userDetailId)) throw new AppException(ErrorCode.UNAUTHENTICATED);

        FileDocument fileDocument = null;

        if (request.getAvatar() != null) {
            FileResponse fileResponse = fileService.storeFile(request.getAvatar());
            fileDocument = fileRepository.findById(fileResponse.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        }

        userDetailMapper.updateUserDetail(request, userDetail);
        userDetail.setAvatar(fileDocument);
        userDetail = userDetailRepository.save(userDetail);
        return userDetailMapper.toUserDetailResponse(userDetail);
    }
}
