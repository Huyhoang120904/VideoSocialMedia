package com.hehe.thesocial.mapper.userDetail;

import com.hehe.thesocial.dto.request.userDetail.UserDetailUpdateRequest;
import com.hehe.thesocial.dto.response.userDetail.QuickUserDetailResponse;
import com.hehe.thesocial.dto.response.userDetail.UserDetailResponse;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.mapper.user.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = {
        UserMapper.class
}, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserDetailMapper {
    void updateUserDetail(UserDetailUpdateRequest request, @MappingTarget UserDetail userDetail);
    UserDetailResponse toUserDetailResponse(UserDetail userDetail);
    QuickUserDetailResponse toQuickUserDetailResponse(UserDetail userDetail);
}
