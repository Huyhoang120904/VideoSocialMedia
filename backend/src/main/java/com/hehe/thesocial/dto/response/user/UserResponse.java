package com.hehe.thesocial.dto.response.user;

import com.hehe.thesocial.dto.response.role.RoleResponse;
import com.hehe.thesocial.entity.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String id;
    String username;
    String mail;
    String phoneNumber;
    Boolean enable;

    Set<RoleResponse> roles;
}
