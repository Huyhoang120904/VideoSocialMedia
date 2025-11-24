import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { searchAll, getSearchHistory, deleteSearchHistory, getSuggestions } from "../../Services/SearchService";
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import FeedItemResponse from "../../Types/response/FeedItemResponse";
import { mapFeedItemResponseToFeedItem } from "../../Utils/feedItemMapper";
import { FeedItem } from "../../Store/feedSlice";
import { UNKNOWN_AVATAR } from "../../Utils/ImageUrlHelper";
import { getImageUrl, getThumbnailUrl } from "../../Utils/ImageUrlHelper";
import { useAuth } from "../../Context/AuthProvider";
import UserDetailService from "../../Services/UserDetailService";
import styles from "./styles";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 18) / 2;
const BASE_ITEM_HEIGHT = 240;

const formatPostDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day} tháng ${month}`;
  } catch {
    return "";
  }
};

interface SearchSuggestion {
  id: string;
  text: string;
  type: "user" | "post";
}

type TabType = "Top" | "Người dùng" | "Video";

const SearchScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  const [currentUserDetailId, setCurrentUserDetailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [users, setUsers] = useState<UserDetailResponse[]>([]);
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [displayedUsersCount, setDisplayedUsersCount] = useState(5);
  const [displayedPostsCount, setDisplayedPostsCount] = useState(6);
  const [activeTab, setActiveTab] = useState<TabType>("Top");
  const [followingStatus, setFollowingStatus] = useState<Map<string, boolean>>(new Map());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // New state for history and recommendations
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recommendedPosts, setRecommendedPosts] = useState<FeedItem[]>([]);

  useEffect(() => {
    if (isAuthenticated && !currentUserDetailId) {
      const fetchCurrentUser = async () => {
        try {
          const response = await UserDetailService.getMyDetails();
          if (response.result) {
            setCurrentUserDetailId(response.result.id);
          }
        } catch (error) {
          console.error("Error fetching current user:", error);
        }
      };
      fetchCurrentUser();
    }
  }, [isAuthenticated, currentUserDetailId]);

  // Fetch history and recommendations
  useEffect(() => {
    const fetchInitialData = async () => {
      if (isAuthenticated && currentUserDetailId) {
        try {
          const historyRes = await getSearchHistory();
          if (historyRes.result) {
            setSearchHistory(historyRes.result);
          }
          const suggestionsRes = await getSuggestions();
          if (suggestionsRes.result) {
            const mapped = suggestionsRes.result.map(p => {
              const item = mapFeedItemResponseToFeedItem(p);
              if (item) (item as any).createdAt = p.createdAt;
              return item;
            }).filter((i): i is FeedItem => i !== null);
            setRecommendedPosts(mapped);
          }
        } catch (e) {
          console.error("Error fetching initial data:", e);
        }
      }
    };
    fetchInitialData();
  }, [isAuthenticated, currentUserDetailId]);

  const reloadUserData = useCallback(async () => {
    if (!searchQuery.trim() || users.length === 0) {
      return;
    }

    try {
      const response = await searchAll(searchQuery.trim());
      if (response.result) {
        const allUsers = (response.result.users || []).slice(0, 10);
        setUsers(allUsers);

        if (isAuthenticated && currentUserDetailId) {
          const statusMap = new Map<string, boolean>();
          const checkPromises = allUsers.map(async (user) => {
            try {
              const followStatusResponse = await UserDetailService.isFollowing(
                currentUserDetailId,
                user.id
              );
              statusMap.set(user.id, followStatusResponse.result || false);
            } catch (error) {
              statusMap.set(user.id, false);
            }
          });
          await Promise.all(checkPromises);
          setFollowingStatus(statusMap);
        }
      }
    } catch (error) {
      console.error("Error reloading user data:", error);
    }
  }, [searchQuery, users.length, isAuthenticated, currentUserDetailId]);

  useFocusEffect(
    useCallback(() => {
      reloadUserData();
    }, [reloadUserData])
  );

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery.trim().length > 0) {
      setSuggestionsLoading(true);
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const response = await searchAll(searchQuery.trim());
          if (response.result) {
            const userSuggestions: SearchSuggestion[] = (response.result.users || [])
              .slice(0, 5)
              .map((user) => ({
                id: `user-${user.id}`,
                text: user.displayName || user.shownName || "User",
                type: "user" as const,
              }));

            const postSuggestions: SearchSuggestion[] = (response.result.posts || [])
              .slice(0, 5)
              .map((post) => ({
                id: `post-${post.id}`,
                text: post.title || post.description || "Post",
                type: "post" as const,
              }));

            setSuggestions([...userSuggestions, ...postSuggestions]);
          }
        } catch (err) {
          console.error("Suggestions search error:", err);
          setSuggestions([]);
        } finally {
          setSuggestionsLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setSuggestionsLoading(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = useCallback(async (queryOverride?: string) => {
    const queryToUse = queryOverride !== undefined ? queryOverride : searchQuery;

    if (!queryToUse.trim()) {
      setShowSuggestions(true);
      return;
    }

    // If override is provided, update state
    if (queryOverride !== undefined) {
      setSearchQuery(queryOverride);
    }

    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    setDisplayedUsersCount(5);
    setDisplayedPostsCount(6);
    setActiveTab("Top");

    try {
      const response = await searchAll(queryToUse.trim());
      if (response.result) {
        const allUsers = (response.result.users || []).slice(0, 10);
        setUsers(allUsers);

        if (isAuthenticated && currentUserDetailId) {
          const statusMap = new Map<string, boolean>();
          const checkPromises = allUsers.map(async (user) => {
            try {
              const followStatusResponse = await UserDetailService.isFollowing(
                currentUserDetailId,
                user.id
              );
              statusMap.set(user.id, followStatusResponse.result || false);
            } catch (error) {
              statusMap.set(user.id, false);
            }
          });
          await Promise.all(checkPromises);
          setFollowingStatus(statusMap);
        }

        const allPosts = (response.result.posts || [])
          .slice(0, 10)
          .map((postResponse) => {
            const mappedItem = mapFeedItemResponseToFeedItem(postResponse);
            if (mappedItem) {
              (mappedItem as any).createdAt = postResponse.createdAt;
            }
            return mappedItem;
          })
          .filter((item): item is FeedItem => item !== null);
        setPosts(allPosts);

        // Refresh history after search
        if (isAuthenticated) {
          getSearchHistory().then(res => {
            if (res.result) setSearchHistory(res.result);
          }).catch(console.error);
        }
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "Không thể tìm kiếm. Vui lòng thử lại.");
      setUsers([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, isAuthenticated, currentUserDetailId]);

  const handleSearchFocus = () => {
    if (!searchQuery.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(true);
    setUsers([]);
    setPosts([]);
    setError(null);
    setSuggestions([]);
    setDisplayedUsersCount(5);
    setDisplayedPostsCount(6);
  };

  const handleLoadMoreUsers = () => {
    setDisplayedUsersCount((prev) => Math.min(prev + 5, users.length));
  };

  const handleLoadMorePosts = () => {
    setDisplayedPostsCount((prev) => Math.min(prev + 6, posts.length));
  };

  const handleCollapseUsers = () => {
    setDisplayedUsersCount(5);
  };

  const handleCollapsePosts = () => {
    setDisplayedPostsCount(6);
  };

  const handleOpenFeedItem = useCallback((feedItem: FeedItem) => {
    const userDetailId = feedItem.uploaderUserId || feedItem.uploader?.id;

    if (!userDetailId) {
      (navigation as any).navigate("MainTabs", {
        screen: "Home",
        params: { videoId: feedItem.id },
      });
      return;
    }

    (navigation as any).navigate("UserFeed", {
      userDetailId,
      initialFeedItemId: feedItem.id,
      userDisplayName:
        feedItem.username ||
        feedItem.uploader?.displayName ||
        feedItem.uploader?.shownName,
    });
  }, [navigation]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleDeleteHistoryItem = async (query: string) => {
    try {
      await deleteSearchHistory(query);
      setSearchHistory(prev => prev.filter(item => item !== query));
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAllHistory = async () => {
    try {
      await deleteSearchHistory();
      setSearchHistory([]);
    } catch (e) {
      console.error(e);
    }
  };

  const renderSuggestionItem = ({ item }: { item: SearchSuggestion }) => {
    const parts = searchQuery.trim()
      ? item.text.split(new RegExp(`(${searchQuery})`, 'gi'))
      : [item.text];

    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSuggestionPress(item)}
      >
        <Ionicons name="search" size={20} color="#666" style={styles.suggestionIcon} />
        <View style={styles.suggestionContent}>
          <Text style={styles.suggestionText}>
            {parts.map((part, index) => {
              const isMatch = searchQuery.trim() &&
                part.toLowerCase() === searchQuery.toLowerCase();
              return (
                <Text
                  key={index}
                  style={isMatch ? styles.suggestionHighlight : {}}
                >
                  {part}
                </Text>
              );
            })}
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color="#999" />
      </TouchableOpacity>
    );
  };

  const handleFollowToggle = async (targetUserId: string, currentStatus: boolean) => {
    if (!isAuthenticated || !currentUserDetailId) return;

    try {
      if (currentStatus) {
        await UserDetailService.unfollowUser(targetUserId);
      } else {
        await UserDetailService.followUser(targetUserId);
      }

      setFollowingStatus((prev) => {
        const newMap = new Map(prev);
        newMap.set(targetUserId, !currentStatus);
        return newMap;
      });

      if (searchQuery.trim()) {
        try {
          const response = await searchAll(searchQuery.trim());
          if (response.result) {
            const allUsers = (response.result.users || []).slice(0, 10);
            setUsers(allUsers);
          }
        } catch (error) {
          console.error("Error reloading user data after follow:", error);
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const renderUserItem = ({ item }: { item: UserDetailResponse }) => {
    const avatarUrl = item.avatar?.url || item.avatar?.secureUrl || undefined;
    const displayName = item.displayName || item.shownName || "User";
    const username = item.user?.username || "";
    const followerCount = item.followerCount || 0;

    const isFollowing = followingStatus.get(item.id) || false;
    const isCurrentUser = currentUserDetailId === item.id;

    const formatFollower = followerCount >= 1000000
      ? `${(followerCount / 1000000).toFixed(1)}M`
      : followerCount >= 1000
        ? `${(followerCount / 1000).toFixed(1)}K`
        : followerCount.toString();

    return (
      <TouchableOpacity
        style={styles.userResultItem}
        onPress={() => {
          (navigation as any).navigate("UserProfile", {
            userDetailId: item.id,
          });
        }}
        activeOpacity={0.7}
      >
        <Image
          source={avatarUrl ? { uri: avatarUrl } : UNKNOWN_AVATAR}
          style={styles.userResultAvatar}
        />
        <View style={styles.userResultContent}>
          <Text style={styles.userResultName} numberOfLines={1}>
            {displayName}
          </Text>
          {username && (
            <Text style={styles.userResultUsername} numberOfLines={1}>
              {username.startsWith('@') ? username : `@${username}`}
            </Text>
          )}
          <Text style={styles.userResultStats} numberOfLines={1}>
            {formatFollower} follower
          </Text>
        </View>
        {!isCurrentUser && (
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing && styles.followButtonFollowed
            ]}
            onPress={(e) => {
              e.stopPropagation();
              handleFollowToggle(item.id, isFollowing);
            }}
          >
            <Text style={[
              styles.followButtonText,
              isFollowing && styles.followButtonTextFollowed
            ]}>
              {isFollowing ? "Đã follow" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderPostGridItem = ({ item, index }: { item: FeedItem; index: number }) => {
    const itemHeight = BASE_ITEM_HEIGHT;
    const thumbnailUrl =
      item.video?.thumbnailUrl ||
      item.imageSlide?.images[0]?.thumbnailUrl ||
      undefined;
    const displayThumbnail = thumbnailUrl ? getThumbnailUrl(thumbnailUrl) : undefined;

    const displayTitle = item.title || item.description || "Nội dung";
    const authorName = item.username || item.uploader?.displayName || item.uploader?.shownName || "Người dùng";
    const isVideo = item.feedItemType === "VIDEO";
    const isMultiImage = item.feedItemType === "IMAGE_SLIDE" && item.imageSlide && item.imageSlide.images.length > 1;

    const formatLikes = item.likes >= 1000000
      ? `${(item.likes / 1000000).toFixed(1)}M`
      : item.likes >= 1000
        ? `${(item.likes / 1000).toFixed(1)}K`
        : item.likes.toString();

    return (
      <TouchableOpacity
        style={[styles.gridItem, { width: ITEM_WIDTH, height: itemHeight }]}
        onPress={() => {
          handleOpenFeedItem(item);
        }}
        activeOpacity={0.8}
      >
        {displayThumbnail ? (
          <Image source={{ uri: displayThumbnail }} style={styles.gridThumbnail} />
        ) : (
          <View style={styles.gridThumbnailPlaceholder}>
            <Ionicons name="image-outline" size={32} color="#999" />
          </View>
        )}

        {isVideo ? (
          <View style={styles.playButtonOverlay}>
            <Ionicons name="play" size={20} color="white" />
          </View>
        ) : (
          <View style={styles.postIndicator}>
            <Ionicons name="image-outline" size={16} color="white" />
          </View>
        )}

        {isMultiImage && (
          <View style={styles.multiImageIndicator}>
            <Ionicons name="copy-outline" size={16} color="white" />
          </View>
        )}

        <View style={styles.gridItemInfo}>
          <Text style={styles.gridItemTitle} numberOfLines={2}>
            {displayTitle}
          </Text>
          <View style={styles.gridItemAuthorRow}>
            <View style={styles.authorInfo}>
              <Image
                source={
                  item.avatarUrl
                    ? { uri: item.avatarUrl }
                    : UNKNOWN_AVATAR
                }
                style={styles.gridItemAvatar}
              />
              <Text style={styles.gridItemAuthor} numberOfLines={1}>
                {authorName}
              </Text>
            </View>
            <View style={styles.gridItemLikes}>
              <Ionicons name="heart" size={12} color="#666" />
              <Text style={styles.gridItemLikesText}>{formatLikes}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredPosts = useMemo(() => {
    let filtered = posts;

    if (activeTab === "Video") {
      filtered = filtered.filter((p) => p.feedItemType === "VIDEO");
    }

    return filtered.slice(0, displayedPostsCount);
  }, [posts, activeTab, displayedPostsCount]);

  const tabs: TabType[] = ["Top", "Người dùng", "Video"];

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => handleSearch()}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>Tìm kiếm</Text>
        </TouchableOpacity>
      </View>

      {showSuggestions && (
        <View style={styles.content}>
          {suggestionsLoading ? (
            <View style={styles.suggestionsLoadingContainer}>
              <ActivityIndicator size="small" color="#FE2C55" />
            </View>
          ) : searchQuery.trim().length === 0 ? (
            <ScrollView style={{ flex: 1 }}>
              {/* History Section */}
              {searchHistory.length > 0 && (
                <View style={styles.historySection}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Lịch sử tìm kiếm</Text>
                    <TouchableOpacity onPress={handleClearAllHistory}>
                      <Text style={{ color: '#666', fontSize: 13 }}>Xóa tất cả</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.historyList}>
                    {searchHistory.map((item, index) => (
                      <View key={index} style={styles.historyItemContainer}>
                        <TouchableOpacity
                          style={styles.historyItem}
                          onPress={() => handleSearch(item)}
                        >
                          <Ionicons name="time-outline" size={20} color="#666" />
                          <Text style={styles.historyText}>{item}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteHistoryItem(item)}>
                          <Ionicons name="close" size={20} color="#999" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Recommendations Section */}
              {recommendedPosts.length > 0 && (
                <View style={styles.recommendationSection}>
                  <Text style={styles.sectionTitle}>Bạn có thể thích</Text>
                  {recommendedPosts.map((post) => (
                    <TouchableOpacity
                      key={post.id}
                      style={styles.recommendationItem}
                      onPress={() => {
                      handleOpenFeedItem(post);
                      }}
                    >
                      <Image
                        source={{ uri: getThumbnailUrl(post.video?.thumbnailUrl || post.imageSlide?.images[0]?.thumbnailUrl || "") }}
                        style={styles.recommendationThumbnail}
                      />
                      <View style={styles.recommendationInfo}>
                        <Text style={styles.recommendationTitle} numberOfLines={2}>{post.title || post.description}</Text>
                        <Text style={styles.recommendationAuthor}>{post.username || post.uploader?.displayName}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          ) : (
            <FlatList
              data={suggestions}
              renderItem={renderSuggestionItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={
                suggestions.length > 0 ? (
                  <View style={styles.suggestionFooter}>
                    <Text style={styles.suggestionFooterText}>
                      Nhấn và giữ đề xuất để báo cáo đề xuất đó
                    </Text>
                  </View>
                ) : null
              }
            />
          )}
        </View>
      )}

      {!showSuggestions && (
        <View style={styles.searchResults}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FE2C55" />
              <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#999" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : users.length === 0 && posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#999" />
              <Text style={styles.emptyText}>
                Không tìm thấy kết quả cho "{searchQuery}"
              </Text>
            </View>
          ) : (
            <>
              <View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={[styles.tabsContainer, { flexGrow: 0 }]}
                  contentContainerStyle={styles.tabsContent}
                  bounces={false}
                >
                  {tabs.map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      style={[
                        styles.tab,
                        activeTab === tab && styles.tabActive,
                      ]}
                      onPress={() => setActiveTab(tab)}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === tab && styles.tabTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {(activeTab === "Top" || activeTab === "Người dùng") && users.length > 0 && (
                  <View style={styles.usersSection}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionHeaderTitle}>Người dùng</Text>
                      {activeTab === "Top" && (
                        <TouchableOpacity onPress={() => setActiveTab("Người dùng")}>
                          <Text style={styles.seeAllText}>Xem tất cả &gt;</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {users.slice(0, displayedUsersCount).map((user) => (
                      <View key={user.id}>
                        {renderUserItem({ item: user })}
                      </View>
                    ))}
                    {users.length > displayedUsersCount ? (
                      <TouchableOpacity
                        style={styles.loadMoreButton}
                        onPress={handleLoadMoreUsers}
                      >
                        <Text style={styles.loadMoreText}>
                          Xem thêm ({users.length - displayedUsersCount} người dùng)
                        </Text>
                        <Ionicons name="chevron-down" size={16} color="#FE2C55" />
                      </TouchableOpacity>
                    ) : displayedUsersCount > 5 && (
                      <TouchableOpacity
                        style={styles.loadMoreButton}
                        onPress={handleCollapseUsers}
                      >
                        <Text style={styles.loadMoreText}>Thu lại</Text>
                        <Ionicons name="chevron-up" size={16} color="#FE2C55" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {activeTab !== "Người dùng" && filteredPosts.length > 0 && (
                  <View style={styles.postsSection}>
                    <FlatList
                      data={filteredPosts}
                      renderItem={renderPostGridItem}
                      keyExtractor={(item) => item.id}
                      numColumns={2}
                      scrollEnabled={false}
                      columnWrapperStyle={styles.gridRow}
                      ListFooterComponent={
                        posts.length > displayedPostsCount ? (
                          <TouchableOpacity
                            style={styles.loadMoreButton}
                            onPress={handleLoadMorePosts}
                          >
                            <Text style={styles.loadMoreText}>
                              Xem thêm ({posts.length - displayedPostsCount} bài viết)
                            </Text>
                            <Ionicons name="chevron-down" size={16} color="#FE2C55" />
                          </TouchableOpacity>
                        ) : displayedPostsCount > 6 ? (
                          <TouchableOpacity
                            style={styles.loadMoreButton}
                            onPress={handleCollapsePosts}
                          >
                            <Text style={styles.loadMoreText}>Thu lại</Text>
                            <Ionicons name="chevron-up" size={16} color="#FE2C55" />
                          </TouchableOpacity>
                        ) : null
                      }
                    />
                  </View>
                )}
              </ScrollView>
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;
