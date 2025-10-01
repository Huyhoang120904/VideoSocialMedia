package com.hehe.thesocial.dto.request.userDetail;

import com.hehe.thesocial.entity.FileDocument;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserDetailUpdateRequest {
    MultipartFile avatar;
    String displayName;
    String bio;

    String shownName;
}
