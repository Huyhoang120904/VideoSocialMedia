# Hướng dẫn Implement Reply Comment (Comment con)

## Tổng quan
Chức năng reply comment cho phép user comment lại comment của người khác, tạo cấu trúc nested comments.

## Bước 1: Backend - Cập nhật Entity và DTO

### 1.1. Cập nhật Comment Entity
Thêm field `parentCommentId` vào `Comment.java`:

```java
@Field("parent_comment_id")
String parentCommentId; // null nếu là comment gốc, có giá trị nếu là reply
```

### 1.2. Cập nhật CommentCreateRequest
Thêm field `parentCommentId` (optional) vào `CommentCreateRequest.java`:

```java
String parentCommentId; // Optional: ID của comment cha (nếu là reply)
```

### 1.3. Cập nhật CommentResponse
Thêm field `parentCommentId` và `replies` vào `CommentResponse.java`:

```java
String parentCommentId; // ID của comment cha (nếu là reply)
List<CommentResponse> replies; // Danh sách replies (optional, chỉ load khi cần)
```

## Bước 2: Backend - Cập nhật Repository

### 2.1. Thêm method vào CommentRepository
Thêm method để tìm replies của một comment:

```java
Page<Comment> findByParentCommentIdOrderByCreatedAtAsc(String parentCommentId, Pageable pageable);
List<Comment> findByParentCommentIdOrderByCreatedAtAsc(String parentCommentId); // Không phân trang
```

## Bước 3: Backend - Cập nhật Service

### 3.1. Cập nhật CommentService interface
Thêm method để reply comment:

```java
CommentCreateResponse replyComment(String parentCommentId, CommentCreateRequest request);
Page<CommentResponse> getRepliesByComment(String commentId, String currentUserDetailId, int page, int size);
```

### 3.2. Cập nhật CommentServiceImpl
- Trong `addComment()`: Kiểm tra nếu có `parentCommentId`, tăng `replyCount` của comment cha
- Implement `replyComment()`: Tương tự `addComment()` nhưng set `parentCommentId`
- Implement `getRepliesByComment()`: Load replies của một comment

## Bước 4: Backend - Cập nhật Controller

### 4.1. Thêm endpoint reply comment
```java
@PostMapping("/comments/{parentCommentId}/replies")
public ResponseEntity<ApiResponse<CommentCreateResponse>> replyComment(
        @PathVariable String parentCommentId,
        @RequestBody CommentCreateRequest request) {
    // Implementation
}
```

### 4.2. Thêm endpoint get replies
```java
@GetMapping("/comments/{commentId}/replies")
public ResponseEntity<ApiResponse<Page<CommentResponse>>> getReplies(
        @PathVariable String commentId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
    // Implementation
}
```

## Bước 5: Frontend - Cập nhật CommentService

### 5.1. Thêm method replyComment
```typescript
async replyComment(
    parentCommentId: string,
    content: string
): Promise<CommentCreateResponse> {
    const response = await api.post(
        `/feed-items/comments/${parentCommentId}/replies`,
        { content }
    );
    return response.data.result || response.data;
}
```

### 5.2. Thêm method getReplies
```typescript
async getReplies(
    commentId: string,
    page: number = 0,
    size: number = 20
): Promise<CommentPageResponse> {
    const response = await api.get(
        `/feed-items/comments/${commentId}/replies`,
        {
            params: { page, size }
        }
    );
    return response.data.result || response.data;
}
```

## Bước 6: Frontend - Cập nhật VideoCommentModal

### 6.1. Cập nhật Comment interface
```typescript
interface Comment {
    id: string;
    username: string;
    avatar: string;
    comment: string;
    timeAgo: string;
    likes: number;
    isLiked?: boolean;
    replyCount?: number; // Số lượng replies
    replies?: Comment[]; // Danh sách replies (load khi expand)
    parentCommentId?: string; // ID của comment cha (nếu là reply)
}
```

### 6.2. Thêm state cho reply
```typescript
const [replyingTo, setReplyingTo] = useState<string | null>(null); // ID của comment đang reply
const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set()); // Set các comment đã expand replies
const [repliesLoading, setRepliesLoading] = useState<Set<string>>(new Set()); // Set các comment đang load replies
```

### 6.3. Thêm handler functions
```typescript
// Bắt đầu reply một comment
const handleStartReply = (commentId: string) => {
    setReplyingTo(commentId);
    inputRef.current?.focus();
};

// Hủy reply
const handleCancelReply = () => {
    setReplyingTo(null);
    setNewComment('');
};

// Gửi reply
const handleSendReply = async () => {
    if (!replyingTo || !newComment.trim()) return;
    
    try {
        setIsSubmitting(true);
        const response = await commentService.replyComment(replyingTo, newComment.trim());
        
        // Thêm reply vào danh sách replies của comment cha
        setCommentsList(prev => prev.map(comment => {
            if (comment.id === replyingTo) {
                return {
                    ...comment,
                    replies: [...(comment.replies || []), {
                        id: response.comment.id,
                        username: response.comment.username,
                        avatar: response.comment.avatarUrl || '',
                        comment: response.comment.content,
                        timeAgo: response.comment.timeAgo || 'vừa xong',
                        likes: response.comment.likeCount || 0,
                        isLiked: response.comment.isLikedByCurrentUser || false,
                        parentCommentId: replyingTo,
                    }],
                    replyCount: (comment.replyCount || 0) + 1,
                };
            }
            return comment;
        }));
        
        setNewComment('');
        setReplyingTo(null);
    } catch (error) {
        console.error('Error sending reply:', error);
        Alert.alert('Lỗi', 'Không thể gửi reply. Vui lòng thử lại.');
    } finally {
        setIsSubmitting(false);
    }
};

// Load replies của một comment
const handleLoadReplies = async (commentId: string) => {
    if (expandedReplies.has(commentId)) {
        // Đã expand rồi, collapse lại
        setExpandedReplies(prev => {
            const newSet = new Set(prev);
            newSet.delete(commentId);
            return newSet;
        });
        return;
    }
    
    try {
        setRepliesLoading(prev => new Set(prev).add(commentId));
        const response = await commentService.getReplies(commentId);
        
        // Cập nhật replies vào comment
        setCommentsList(prev => prev.map(comment => {
            if (comment.id === commentId) {
                return {
                    ...comment,
                    replies: response.content.map(reply => ({
                        id: reply.id,
                        username: reply.username,
                        avatar: reply.avatarUrl || '',
                        comment: reply.content,
                        timeAgo: reply.timeAgo || 'vừa xong',
                        likes: reply.likeCount || 0,
                        isLiked: reply.isLikedByCurrentUser || false,
                        parentCommentId: commentId,
                    })),
                };
            }
            return comment;
        }));
        
        setExpandedReplies(prev => new Set(prev).add(commentId));
    } catch (error) {
        console.error('Error loading replies:', error);
        Alert.alert('Lỗi', 'Không thể tải replies. Vui lòng thử lại.');
    } finally {
        setRepliesLoading(prev => {
            const newSet = new Set(prev);
            newSet.delete(commentId);
            return newSet;
        });
    }
};
```

### 6.4. Cập nhật renderComment
```typescript
const renderComment = ({ item }: { item: Comment }) => {
    const isReplying = replyingTo === item.id;
    const hasReplies = (item.replyCount || 0) > 0;
    const isExpanded = expandedReplies.has(item.id);
    const isLoadingReplies = repliesLoading.has(item.id);
    
    return (
        <View style={styles.commentItem}>
            {/* Avatar và content như cũ */}
            <TouchableOpacity
                onPress={() => handleAvatarPress(item.username)}
                activeOpacity={0.8}
            >
                <Image 
                    source={item.avatar ? { uri: item.avatar } : UNKNOWN_AVATAR} 
                    style={styles.commentAvatar} 
                />
            </TouchableOpacity>
            
            <View style={styles.commentContent}>
                <View style={styles.commentTopRow}>
                    <View style={styles.commentLeft}>
                        <Text style={styles.commentUsername}>{item.username}</Text>
                        <Text style={styles.commentText}>{item.comment}</Text>
                        <View style={styles.commentMeta}>
                            <Text style={styles.commentTime}>{item.timeAgo}</Text>
                            
                            {/* Nút Trả lời */}
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.replyLink}
                                onPress={() => handleStartReply(item.id)}
                            >
                                <Text style={styles.replyLinkText}>Trả lời</Text>
                            </TouchableOpacity>
                            
                            {/* Like button như cũ */}
                            {/* ... */}
                        </View>
                    </View>
                </View>
                
                {/* Hiển thị replies nếu đã expand */}
                {isExpanded && item.replies && item.replies.length > 0 && (
                    <View style={styles.repliesContainer}>
                        {item.replies.map((reply) => (
                            <View key={reply.id} style={styles.replyItem}>
                                {/* Render reply tương tự comment */}
                                {/* ... */}
                            </View>
                        ))}
                    </View>
                )}
                
                {/* Nút xem replies */}
                {hasReplies && (
                    <TouchableOpacity
                        style={styles.viewRepliesButton}
                        onPress={() => handleLoadReplies(item.id)}
                        disabled={isLoadingReplies}
                    >
                        {isLoadingReplies ? (
                            <ActivityIndicator size="small" color="#666" />
                        ) : (
                            <Text style={styles.viewRepliesText}>
                                {isExpanded 
                                    ? 'Ẩn replies' 
                                    : `Xem ${item.replyCount} replies`}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};
```

### 6.5. Cập nhật input box
```typescript
// Trong input container, hiển thị thông tin đang reply
{replyingTo && (
    <View style={styles.replyingToContainer}>
        <Text style={styles.replyingToText}>
            Đang trả lời {commentsList.find(c => c.id === replyingTo)?.username}
        </Text>
        <TouchableOpacity onPress={handleCancelReply}>
            <Ionicons name="close-circle" size={20} color="#666" />
        </TouchableOpacity>
    </View>
)}

// Khi submit, kiểm tra nếu đang reply thì gọi handleSendReply
const handleSendComment = async () => {
    if (replyingTo) {
        await handleSendReply();
    } else {
        // Logic gửi comment bình thường như cũ
        // ...
    }
};
```

## Bước 7: Thêm styles cho replies

Thêm vào `styles.tsx`:

```typescript
repliesContainer: {
    marginTop: 12,
    marginLeft: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(0, 0, 0, 0.1)',
},
replyItem: {
    flexDirection: 'row',
    marginBottom: 12,
},
replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
},
replyingToText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'TikTokSans-Regular',
},
```

## Tóm tắt Flow

1. User click "Trả lời" → Set `replyingTo` = commentId, focus input
2. User nhập nội dung và gửi → Gọi `replyComment(parentCommentId, content)`
3. Backend tạo reply comment với `parentCommentId`, tăng `replyCount` của comment cha
4. Frontend thêm reply vào danh sách `replies` của comment cha
5. User click "Xem X replies" → Load replies từ API, hiển thị nested
6. User click "Ẩn replies" → Collapse danh sách replies

## Lưu ý

- Chỉ load replies khi user click "Xem replies" để tối ưu performance
- Có thể implement pagination cho replies nếu có nhiều
- Có thể giới hạn độ sâu của nested replies (ví dụ: chỉ 2 cấp)

