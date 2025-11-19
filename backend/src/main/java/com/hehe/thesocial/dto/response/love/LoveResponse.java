package com.hehe.thesocial.dto.response.love;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoveResponse {
    boolean loved; // Trạng thái hiện tại của user với feed item này
    long loveCount; // Tổng số lượt yêu thích
    String message; // Thông báo
}
