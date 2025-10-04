package com.hehe.thesocial.service.userDetail;

import com.hehe.thesocial.dto.request.userDetail.UserDetailCreateRequest;
import com.hehe.thesocial.dto.request.userDetail.UserDetailUpdateRequest;
import com.hehe.thesocial.dto.response.userDetail.UserDetailResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface UserDetailService {

    // Read
    UserDetailResponse getMyDetail();
    UserDetailResponse getUserDetailById(String userDetailId);
    UserDetailResponse getUserDetailByUserId(String userId);
    List<UserDetailResponse> getAllUserDetails();
    Page<UserDetailResponse> getUserDetailsPaginated(Pageable pageable);
    List<UserDetailResponse> searchUserDetailsByDisplayName(String displayName);
    List<UserDetailResponse> searchUserDetailsByUsername(String username);

    // Update
    UserDetailResponse updateUserDetail(String userDetailId, UserDetailUpdateRequest request);

    // Delete
    void deleteUserDetail(String userDetailId);

    // Following functionality
    UserDetailResponse followUser(String targetUserDetailId);
    UserDetailResponse unfollowUser(String targetUserDetailId);
    List<UserDetailResponse> getFollowers(String userDetailId);
    List<UserDetailResponse> getFollowing(String userDetailId);
    boolean isFollowing(String userDetailId, String targetUserDetailId);
}
