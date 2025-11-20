package com.hehe.thesocial.mapper.userDetail;

import com.hehe.thesocial.dto.request.userDetail.UserDetailUpdateRequest;
import com.hehe.thesocial.dto.response.userDetail.QuickUserDetailResponse;
import com.hehe.thesocial.dto.response.userDetail.UserDetailResponse;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.mapper.user.UserMapper;
import org.mapstruct.AfterMapping;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = {
        UserMapper.class,
        FileMapper.class
}, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserDetailMapper {
    void updateUserDetail(UserDetailUpdateRequest request, @MappingTarget UserDetail userDetail);
    
    @Mapping(target = "avatar", ignore = true)
    UserDetailResponse toUserDetailResponse(UserDetail userDetail, @Context FileMapper fileMapper);
    
    QuickUserDetailResponse toQuickUserDetailResponse(UserDetail userDetail);

    @AfterMapping
    default void mapAvatar(@MappingTarget UserDetailResponse response,
                          UserDetail userDetail,
                          @Context FileMapper fileMapper) {
        if (userDetail.getAvatar() != null) {
            response.setAvatar(fileMapper.toFileResponse(userDetail.getAvatar()));
        }
    }
}
