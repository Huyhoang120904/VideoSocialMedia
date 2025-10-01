package com.hehe.thesocial.service.userDetail;

import com.hehe.thesocial.dto.request.userDetail.UserDetailUpdateRequest;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.dto.response.userDetail.UserDetailResponse;
import com.hehe.thesocial.entity.FileDocument;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.mapper.userDetail.UserDetailMapper;
import com.hehe.thesocial.repository.FileRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.service.file.FileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserDetailServiceImpl implements UserDetailService {
    UserDetailRepository userDetailRepository;
    UserDetailMapper userDetailMapper;
    FileService fileService;
    FileRepository fileRepository;

    @Override
    public UserDetailResponse getMyDetail() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDetail userDetail = userDetailRepository.findByUser_Id(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return userDetailMapper.toUserDetailResponse(userDetail);
    }

    @Transactional
    @Override
    public UserDetailResponse updateUserDetail(String userDetailId, UserDetailUpdateRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDetail userDetail = userDetailRepository.findByUser_Id(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

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
