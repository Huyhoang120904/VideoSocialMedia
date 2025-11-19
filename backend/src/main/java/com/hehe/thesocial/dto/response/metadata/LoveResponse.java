package com.hehe.thesocial.dto.response.metadata;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoveResponse {
    boolean loved;
    long loveCount;
}
