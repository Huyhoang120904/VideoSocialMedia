package com.hehe.thesocial.dto.response.search;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.dto.response.userDetail.UserDetailResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SearchResultResponse {

    List<UserDetailResponse> users;

    List<FeedItemResponse> posts;
}


