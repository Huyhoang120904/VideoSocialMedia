package com.hehe.thesocial.dto.response.userDetail;

import com.hehe.thesocial.entity.FileDocument;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuickUserDetailResponse {
    String id;
    String userId;
    FileDocument avatar;
    String displayName;
}
