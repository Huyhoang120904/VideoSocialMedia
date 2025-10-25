package com.hehe.thesocial.service.userDetail;

import com.hehe.thesocial.dto.request.userDetail.UserDetailCreateRequest;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

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

    @Transactional
    public UserDetailResponse createUserDetail(UserDetailCreateRequest request) {
        // Verify user exists
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Check if user detail already exists
        if (userDetailRepository.findByUser(user).isPresent()) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        FileDocument avatar = null;
        if (request.getAvatar() != null) {
            FileResponse fileResponse = fileService.storeFile(request.getAvatar());
            avatar = fileRepository.findById(fileResponse.getId())
                    .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));
        }

        UserDetail userDetail = UserDetail.builder()
                .user(user)
                .avatar(avatar)
                .displayName(request.getDisplayName())
                .bio(request.getBio())
                .shownName(request.getShownName())
                .following(new HashSet<>())
                .followingCount(0)
                .follower(new HashSet<>())
                .followerCount(0)
                .build();

        userDetail = userDetailRepository.save(userDetail);
        return userDetailMapper.toUserDetailResponse(userDetail);
    }

    @Override
    public UserDetailResponse getMyDetail() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("User ID: {}", userId);

        // Use the updated repository method that works with DocumentReference
        UserDetail userDetail = userDetailRepository.findByUser(User.builder().id(userId).build())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        return userDetailMapper.toUserDetailResponse(userDetail);
    }

    @Override
    public UserDetailResponse getUserDetailById(String userDetailId) {
        UserDetail userDetail = userDetailRepository.findById(userDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        return userDetailMapper.toUserDetailResponse(userDetail);
    }

    @Override
    public UserDetailResponse getUserDetailByUserId(String userDetailId) {

        UserDetail userDetail = userDetailRepository.findById(userDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        return userDetailMapper.toUserDetailResponse(userDetail);
    }

    @Override
    public List<UserDetailResponse> getAllUserDetails() {
        List<UserDetail> userDetails = userDetailRepository.findAll();
        return userDetails.stream()
                .map(userDetailMapper::toUserDetailResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<UserDetailResponse> getUserDetailsPaginated(Pageable pageable) {
        Page<UserDetail> userDetailsPage = userDetailRepository.findAll(pageable);
        return userDetailsPage.map(userDetailMapper::toUserDetailResponse);
    }

    @Override
    public List<UserDetailResponse> searchUserDetailsByDisplayName(String displayName) {
        List<UserDetail> userDetails = userDetailRepository.findByDisplayNameContainingIgnoreCase(displayName);
        return userDetails.stream()
                .map(userDetailMapper::toUserDetailResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDetailResponse> searchUserDetailsByUsername(String username) {
        List<UserDetail> userDetails = userDetailRepository.findByUserUsernameContainingIgnoreCase(username);
        return userDetails.stream()
                .map(userDetailMapper::toUserDetailResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public UserDetailResponse updateUserDetail(String userDetailId, UserDetailUpdateRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDetail userDetail = userDetailRepository.findByUserId(userId)
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

    @Transactional
    @Override
    public void deleteUserDetail(String userDetailId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        UserDetail userDetail = userDetailRepository.findById(userDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        // Check if the current user owns this user detail or is admin
        if (!userDetail.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // Remove this user from all followers' following lists and following users' follower lists
        if (userDetail.getFollowing() != null) {
            for (UserDetail followingUser : userDetail.getFollowing()) {
                followingUser.getFollower().remove(userDetail);
                followingUser.setFollowerCount(followingUser.getFollowerCount() - 1);
                userDetailRepository.save(followingUser);
            }
        }

        if (userDetail.getFollower() != null) {
            for (UserDetail followerUser : userDetail.getFollower()) {
                followerUser.getFollowing().remove(userDetail);
                followerUser.setFollowingCount(followerUser.getFollowingCount() - 1);
                userDetailRepository.save(followerUser);
            }
        }

        userDetailRepository.delete(userDetail);
    }

    @Transactional
    @Override
    public UserDetailResponse followUser(String targetUserDetailId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        // Get current user's detail
        UserDetail currentUserDetail = userDetailRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        // Get target user's detail
        UserDetail targetUserDetail = userDetailRepository.findById(targetUserDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        // Can't follow yourself
        if (currentUserDetail.getId().equals(targetUserDetailId)) {
            throw new AppException(ErrorCode.INVALID_KEY); // Reusing existing error code
        }

        // Check if already following
        if (currentUserDetail.getFollowing() != null && currentUserDetail.getFollowing().contains(targetUserDetail)) {
            throw new AppException(ErrorCode.USER_EXISTED); // Already following
        }

        // Initialize sets if null
        if (currentUserDetail.getFollowing() == null) {
            currentUserDetail.setFollowing(new HashSet<>());
        }
        if (targetUserDetail.getFollower() == null) {
            targetUserDetail.setFollower(new HashSet<>());
        }

        // Add follow relationship
        currentUserDetail.getFollowing().add(targetUserDetail);
        currentUserDetail.setFollowingCount(currentUserDetail.getFollowingCount() + 1);

        targetUserDetail.getFollower().add(currentUserDetail);
        targetUserDetail.setFollowerCount(targetUserDetail.getFollowerCount() + 1);

        // Save both users
        userDetailRepository.save(currentUserDetail);
        userDetailRepository.save(targetUserDetail);

        return userDetailMapper.toUserDetailResponse(currentUserDetail);
    }

    @Transactional
    @Override
    public UserDetailResponse unfollowUser(String targetUserDetailId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        // Get current user's detail
        UserDetail currentUserDetail = userDetailRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        // Get target user's detail
        UserDetail targetUserDetail = userDetailRepository.findById(targetUserDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Check if actually following
        if (currentUserDetail.getFollowing() == null || !currentUserDetail.getFollowing().contains(targetUserDetail)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND); // Not following
        }

        // Remove follow relationship
        currentUserDetail.getFollowing().remove(targetUserDetail);
        currentUserDetail.setFollowingCount(Math.max(0, currentUserDetail.getFollowingCount() - 1));

        targetUserDetail.getFollower().remove(currentUserDetail);
        targetUserDetail.setFollowerCount(Math.max(0, targetUserDetail.getFollowerCount() - 1));

        // Save both users
        userDetailRepository.save(currentUserDetail);
        userDetailRepository.save(targetUserDetail);

        return userDetailMapper.toUserDetailResponse(currentUserDetail);
    }

    @Override
    public List<UserDetailResponse> getFollowers(String userDetailId) {
        UserDetail userDetail = userDetailRepository.findById(userDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (userDetail.getFollower() == null) {
            return List.of();
        }

        return userDetail.getFollower().stream()
                .map(userDetailMapper::toUserDetailResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDetailResponse> getFollowing(String userDetailId) {
        UserDetail userDetail = userDetailRepository.findById(userDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (userDetail.getFollowing() == null) {
            return List.of();
        }

        return userDetail.getFollowing().stream()
                .map(userDetailMapper::toUserDetailResponse)
                .collect(Collectors.toList());
    }

    @Override
    public boolean isFollowing(String userDetailId, String targetUserDetailId) {
        UserDetail userDetail = userDetailRepository.findById(userDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UserDetail targetUserDetail = userDetailRepository.findById(targetUserDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return userDetail.getFollowing() != null &&
                userDetail.getFollowing().contains(targetUserDetail);
    }
}
