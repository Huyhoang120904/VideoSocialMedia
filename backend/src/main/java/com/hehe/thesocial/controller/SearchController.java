package com.hehe.thesocial.controller;

import com.hehe.thesocial.dto.ApiResponse;
import com.hehe.thesocial.dto.response.feed.FeedItemResponse;
import com.hehe.thesocial.dto.response.userDetail.UserDetailResponse;
import com.hehe.thesocial.dto.response.search.SearchResultResponse;
import com.hehe.thesocial.entity.FeedItem;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.mapper.feedItem.FeedItemMapper;
import com.hehe.thesocial.mapper.file.FileMapper;
import com.hehe.thesocial.mapper.userDetail.UserDetailMapper;
import com.hehe.thesocial.service.search.SearchService;
import com.hehe.thesocial.service.userDetail.UserDetailService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SearchController {
        SearchService searchService;
        FeedItemMapper feedItemMapper;
        UserDetailMapper userDetailMapper;
        FileMapper fileMapper;
        UserDetailService userDetailService;

        @GetMapping
        public ResponseEntity<ApiResponse<SearchResultResponse>> searchAll(@RequestParam String keyword) {
                try {
                        UserDetailResponse currentUser = userDetailService.getMyDetail();
                        searchService.saveSearchHistory(currentUser.getId(), keyword);
                } catch (Exception e) {
                        // Ignore
                }

                List<UserDetail> users = searchService.searchUsers(keyword);
                List<FeedItem> items = searchService.searchFeedItems(keyword);

                List<UserDetailResponse> userResponses = users.stream()
                                .map(u -> userDetailMapper.toUserDetailResponse(u, fileMapper))
                                .collect(Collectors.toList());

                List<FeedItemResponse> postResponses = items.stream()
                                // Pass null for currentUserId for now
                                .map(item -> feedItemMapper.toFeedItemResponse(item, fileMapper, userDetailMapper,
                                                null))
                                .collect(Collectors.toList());

                SearchResultResponse result = SearchResultResponse.builder()
                                .users(userResponses)
                                .posts(postResponses)
                                .build();

                return ResponseEntity.ok(
                                ApiResponse.<SearchResultResponse>builder()
                                                .result(result)
                                                .build());
        }

        @GetMapping("/users")
        public ResponseEntity<ApiResponse<List<UserDetailResponse>>> searchUsers(@RequestParam String keyword) {
                List<UserDetail> users = searchService.searchUsers(keyword);
                List<UserDetailResponse> response = users.stream()
                                .map(u -> userDetailMapper.toUserDetailResponse(u, fileMapper))
                                .collect(Collectors.toList());

                return ResponseEntity.ok(ApiResponse.<List<UserDetailResponse>>builder()
                                .result(response)
                                .build());
        }

        @GetMapping("/posts")
        public ResponseEntity<ApiResponse<List<FeedItemResponse>>> searchPosts(@RequestParam String keyword) {
                List<FeedItem> items = searchService.searchFeedItems(keyword);
                // Pass null for currentUserId for now
                List<FeedItemResponse> response = items.stream()
                                .map(item -> feedItemMapper.toFeedItemResponse(item, fileMapper, userDetailMapper,
                                                null))
                                .collect(Collectors.toList());

                return ResponseEntity.ok(ApiResponse.<List<FeedItemResponse>>builder()
                                .result(response)
                                .build());
        }

        @GetMapping("/history")
        public ResponseEntity<ApiResponse<List<String>>> getSearchHistory() {
                try {
                        UserDetailResponse currentUser = userDetailService.getMyDetail();
                        return ResponseEntity.ok(ApiResponse.<List<String>>builder()
                                        .result(searchService.getSearchHistory(currentUser.getId()))
                                        .build());
                } catch (Exception e) {
                        return ResponseEntity.ok(ApiResponse.<List<String>>builder()
                                        .result(List.of())
                                        .build());
                }
        }

        @DeleteMapping("/history")
        public ResponseEntity<ApiResponse<Void>> deleteSearchHistory(@RequestParam(required = false) String query) {
                try {
                        UserDetailResponse currentUser = userDetailService.getMyDetail();
                        if (query != null && !query.isEmpty()) {
                                searchService.deleteSearchHistoryItem(currentUser.getId(), query);
                        } else {
                                searchService.deleteSearchHistory(currentUser.getId());
                        }
                } catch (Exception e) {
                        // Ignore
                }
                return ResponseEntity.ok(ApiResponse.<Void>builder().build());
        }

        @GetMapping("/suggestions")
        public ResponseEntity<ApiResponse<List<FeedItemResponse>>> getSuggestions() {
                String userId = null;
                try {
                        UserDetailResponse currentUser = userDetailService.getMyDetail();
                        userId = currentUser.getId();
                } catch (Exception e) {
                        // Ignore
                }

                List<FeedItem> items = searchService.getSuggestions(userId);
                List<FeedItemResponse> response = items.stream()
                                .map(item -> feedItemMapper.toFeedItemResponse(item, fileMapper, userDetailMapper,
                                                null))
                                .collect(Collectors.toList());

                return ResponseEntity.ok(ApiResponse.<List<FeedItemResponse>>builder()
                                .result(response)
                                .build());
        }
}
