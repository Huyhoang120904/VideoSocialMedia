package com.hehe.thesocial.dto.response.metadata;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ViewResponse {
    String feedItemId;
    Long viewsCount;
    boolean watched;
}


