package com.hehe.thesocial.mapper.user;


import com.hehe.thesocial.dto.request.user.RegisterRequest;
import com.hehe.thesocial.dto.response.user.UserResponse;
import com.hehe.thesocial.entity.User;
import com.hehe.thesocial.mapper.role.RoleMapper;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = {
        RoleMapper.class
}, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserMapper {

    User toUser(RegisterRequest request);


    UserResponse toUserResponse(User user);
}
