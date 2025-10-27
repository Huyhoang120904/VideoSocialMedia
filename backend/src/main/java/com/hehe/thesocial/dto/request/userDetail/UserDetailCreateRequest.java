package com.hehe.thesocial.dto.request.userDetail;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserDetailCreateRequest {
    String userId;
    MultipartFile avatar;
    String displayName;
    String bio;
    String shownName;
}
