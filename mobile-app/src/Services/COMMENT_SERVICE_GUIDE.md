# Comment Service API Guide

## Overview
Service để quản lý comments và interactions (like/unlike) cho video posts.

## Interfaces

### Comment
```typescript
interface Comment {
    id: string;
    content: string;
    likeCount: number;
    username: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
    isLikedByCurrentUser?: boolean;
}
```

### CommentCreateResponse
```typescript
interface CommentCreateResponse {
    comment: Comment;        // Comment vừa tạo
    totalComments: number;   // Tổng số comments của video
}
```

### CommentActionResponse
```typescript
interface CommentActionResponse {
    liked: boolean;          // Trạng thái liked sau action
    disliked: boolean;       // Trạng thái disliked sau action
    likeCount: number;       // Số lượng likes mới
    dislikeCount: number;    // Số lượng dislikes mới
}
```

### CommentPageResponse
```typescript
interface CommentPageResponse {
    content: Comment[];      // Danh sách comments
    totalElements: number;   // Tổng số comments
    totalPages: number;      // Tổng số trang
    size: number;           // Kích thước trang
    number: number;         // Trang hiện tại
}
```

## API Methods

### 1. Thêm Comment
```typescript
async addComment(feedItemId: string, content: string): Promise<CommentCreateResponse>
```

**Ví dụ:**
```typescript
const response = await commentService.addComment('video123', 'Great video!');
console.log(response.comment);           // Comment vừa tạo
console.log(response.totalComments);     // Tổng số comments: 42
```

**Backend endpoint:** `POST /feed-items/{feedItemId}/comments`

---

### 2. Lấy danh sách Comments
```typescript
async getComments(
    feedItemId: string, 
    page?: number, 
    size?: number
): Promise<CommentPageResponse>
```

**Ví dụ:**
```typescript
const response = await commentService.getComments('video123', 0, 20);
console.log(response.content);           // Array of comments
console.log(response.totalElements);     // Tổng số: 42
```

**Backend endpoint:** `GET /feed-items/{feedItemId}/comments?page=0&size=20`

---

### 3. Like Comment
```typescript
async likeComment(commentId: string): Promise<CommentActionResponse>
```

**Ví dụ:**
```typescript
const response = await commentService.likeComment('comment123');
console.log(response.liked);            // true
console.log(response.likeCount);        // 15
```

**Backend endpoint:** `POST /feed-items/comments/{commentId}/like`

---

### 4. Unlike Comment
```typescript
async unlikeComment(commentId: string): Promise<CommentActionResponse>
```

**Ví dụ:**
```typescript
const response = await commentService.unlikeComment('comment123');
console.log(response.liked);            // false
console.log(response.likeCount);        // 14
```

**Backend endpoint:** `DELETE /feed-items/comments/{commentId}/like`

---

### 5. Toggle Like (Helper Method)
```typescript
async toggleCommentLike(
    commentId: string, 
    isCurrentlyLiked: boolean
): Promise<CommentActionResponse>
```

**Ví dụ:**
```typescript
// Nếu đang liked → unlike, nếu chưa → like
const response = await commentService.toggleCommentLike('comment123', true);
console.log(response.liked);            // false (đã unlike)
console.log(response.likeCount);        // 14
```

**Logic:** Tự động gọi `likeComment()` hoặc `unlikeComment()` dựa vào `isCurrentlyLiked`

---

### 6. Xóa Comment
```typescript
async removeComment(commentId: string): Promise<boolean>
```

**Ví dụ:**
```typescript
const success = await commentService.removeComment('comment123');
console.log(success);  // true
```

**Backend endpoint:** `DELETE /feed-items/comments/{commentId}`

---

## Usage Examples

### Scenario 1: Hiển thị comments trong modal
```typescript
const VideoCommentModal = ({ videoId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadComments();
    }, [videoId]);

    const loadComments = async () => {
        try {
            setLoading(true);
            const response = await commentService.getComments(videoId, 0, 50);
            
            const mappedComments = response.content.map(comment => ({
                id: comment.id,
                username: comment.username,
                avatar: comment.avatarUrl || 'default.png',
                comment: comment.content,
                timeAgo: formatTime(comment.createdAt),
                likes: comment.likeCount,
                isLiked: comment.isLikedByCurrentUser || false,
            }));
            
            setComments(mappedComments);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoading(false);
        }
    };
};
```

### Scenario 2: Thêm comment mới
```typescript
const handleSendComment = async (text: string) => {
    try {
        const response = await commentService.addComment(videoId, text);
        
        // Update danh sách comments
        const newComment = {
            id: response.comment.id,
            username: 'You',
            comment: response.comment.content,
            timeAgo: 'vừa xong',
            likes: 0,
            isLiked: false,
        };
        setComments([newComment, ...comments]);
        
        // Update tổng số comments ở ngoài
        onUpdateCommentCount(response.totalComments);
        
    } catch (error) {
        Alert.alert('Lỗi', 'Không thể thêm bình luận');
    }
};
```

### Scenario 3: Like/Unlike comment với optimistic update
```typescript
const handleLikeComment = async (commentId: string) => {
    try {
        const currentComment = comments.find(c => c.id === commentId);
        const isLiked = currentComment?.isLiked || false;

        // 1. Optimistic UI update (ngay lập tức)
        setComments(prev =>
            prev.map(comment =>
                comment.id === commentId
                    ? {
                        ...comment,
                        isLiked: !isLiked,
                        likes: isLiked ? comment.likes - 1 : comment.likes + 1
                    }
                    : comment
            )
        );

        // 2. Gọi API
        const response = await commentService.toggleCommentLike(commentId, isLiked);

        // 3. Update với dữ liệu thật từ backend
        setComments(prev =>
            prev.map(comment =>
                comment.id === commentId
                    ? {
                        ...comment,
                        isLiked: response.liked,
                        likes: response.likeCount
                    }
                    : comment
            )
        );

    } catch (error) {
        // Rollback nếu API fail
        setComments(prev =>
            prev.map(comment =>
                comment.id === commentId
                    ? {
                        ...comment,
                        isLiked: !comment.isLiked,
                        likes: comment.isLiked ? comment.likes + 1 : comment.likes - 1
                    }
                    : comment
            )
        );
        Alert.alert('Lỗi', 'Không thể thực hiện thao tác');
    }
};
```

## Best Practices

### 1. Optimistic Updates
Luôn update UI trước, gọi API sau để UX mượt mà:
```typescript
// ✅ GOOD: Update UI ngay lập tức
setLiked(!liked);
setLikes(liked ? likes - 1 : likes + 1);
const response = await api.likeComment(id);

// ❌ BAD: Đợi API xong mới update
const response = await api.likeComment(id);
setLiked(response.liked);
```

### 2. Error Handling với Rollback
Luôn rollback về trạng thái cũ nếu API fail:
```typescript
try {
    // Optimistic update
    updateUI();
    await api.call();
} catch (error) {
    // Rollback
    revertUI();
    showError();
}
```

### 3. Pagination
Load comments theo trang để tránh quá tải:
```typescript
const [page, setPage] = useState(0);
const loadMore = async () => {
    const response = await commentService.getComments(videoId, page + 1, 20);
    setComments([...comments, ...response.content]);
    setPage(page + 1);
};
```

### 4. Debouncing cho Like
Tránh spam like button:
```typescript
import { debounce } from 'lodash';

const debouncedLike = debounce(async (commentId) => {
    await commentService.toggleCommentLike(commentId, isLiked);
}, 500);
```

## Backend Integration

### Authentication
Tất cả API đều cần JWT token trong header:
```typescript
headers: {
    'Authorization': 'Bearer <token>'
}
```

Backend tự lấy `userDetailId` từ JWT, frontend không cần gửi.

### Response Format
Tất cả responses được wrap trong `ApiResponse`:
```json
{
    "code": 1000,
    "result": { ... },
    "message": "Success"
}
```

Service tự extract `result`:
```typescript
return response.data.result || response.data;
```

## Error Codes
- `404` - Comment/FeedItem not found
- `403` - Không có quyền xóa comment (chỉ tác giả mới xóa được)
- `400` - Invalid request (content rỗng, etc.)

## Performance Tips

1. **Cache comments locally** để tránh load lại mỗi lần mở modal
2. **Use pagination** thay vì load all comments
3. **Debounce like actions** để tránh spam API
4. **Optimistic updates** để UI responsive hơn
5. **Error rollback** để UX tốt hơn khi network fail
