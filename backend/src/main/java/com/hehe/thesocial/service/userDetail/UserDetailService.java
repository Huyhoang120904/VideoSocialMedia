package com.hehe.thesocial.service.userDetail;

import com.hehe.thesocial.dto.request.userDetail.UserDetailUpdateRequest;
import com.hehe.thesocial.dto.response.userDetail.UserDetailResponse;
import org.springframework.stereotype.Service;

@Service
public interface UserDetailService {
    UserDetailResponse updateUserDetail(String userDetailId, UserDetailUpdateRequest request);
    UserDetailResponse getMyDetail();
}
