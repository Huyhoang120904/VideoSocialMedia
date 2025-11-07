package com.hehe.thesocial.dto.response.feedItem;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FeedItemListResponse {
    Page<FeedItemUploadResponse> feedItems;
    String message;
    long totalElements;
    int totalPages;
    int currentPage;
    int pageSize;
}


