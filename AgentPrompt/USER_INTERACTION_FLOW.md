# UserInteraction Flow Documentation

## 📋 Tổng quan

`UserInteraction` là entity dùng để lưu thời gian xem video của người dùng. Khi người dùng xem hết video và lướt xuống, hệ thống sẽ tự động tạo một bản ghi `UserInteraction` với `interactionType = VIEW`.

**Lưu ý quan trọng:**
- ✅ Chỉ track cho **VIDEO** posts
- ❌ **KHÔNG** track cho ImageSlide posts

---

## 🏗️ Kiến trúc

### Backend Entity

```java
@Document(collection = "user_interaction")
public class UserInteraction {
    String id;
    String userDetailId;      // ID của user đang xem
    String feedItemId;         // ID của video đã xem
    InteractionType interactionType;  // VIEW, LIKE, COMMENT, etc.
    Double watchDuration;      // Thời gian xem (giây)
    Double watchPercentage;   // Phần trăm đã xem
    LocalDateTime createdAt;
}
```

### Frontend Request

```typescript
interface UserInteractionRequest {
    feedItemId: string;
    userDetailId: string;
    watchDuration: number;  // in seconds
}
```

---

## 🔄 Luồng hoạt động

### 1. **VideoCard Component (Frontend)**

**File:** `mobile-app/src/Components/Post/VideoCard.tsx`

#### Bước 1: Khởi tạo tracking

```typescript
// Refs để track thời gian xem
const watchStartTime = useRef<number | null>(null);
const accumulatedWatchTime = useRef<number>(0);
const userDetailIdRef = useRef<string | null>(null);
```

#### Bước 2: Load UserDetailId

Khi component mount và user đã authenticated:

```typescript
useEffect(() => {
    if (isAuthenticated && !userDetailIdRef.current) {
        UserDetailService.getMyDetails()
            .then((response) => {
                if (response.result?.id) {
                    userDetailIdRef.current = response.result.id;
                }
            });
    }
}, [isAuthenticated]);
```

#### Bước 3: Bắt đầu track khi video active

Khi `isActive = true` (video đang được hiển thị):

```typescript
useEffect(() => {
    if (isActive) {
        player.play();
        // Bắt đầu track thời gian
        watchStartTime.current = Date.now();
    } else {
        player.pause();
        // Tính toán và lưu thời gian xem
        if (watchStartTime.current !== null) {
            const watchDuration = (Date.now() - watchStartTime.current) / 1000;
            accumulatedWatchTime.current += watchDuration;
            watchStartTime.current = null;
            
            // Gửi lên backend
            if (userDetailIdRef.current && accumulatedWatchTime.current > 0) {
                UserInteractionService.saveInteraction({
                    feedItemId: video.id,
                    userDetailId: userDetailIdRef.current,
                    watchDuration: accumulatedWatchTime.current,
                });
            }
        }
    }
}, [isActive, player, video.uri, video.id]);
```

#### Bước 4: Reset khi chuyển video

```typescript
useEffect(() => {
    watchStartTime.current = null;
    accumulatedWatchTime.current = 0;
}, [video.id]);
```

---

### 2. **UserInteractionService (Frontend)**

**File:** `mobile-app/src/Services/UserInteractionService.ts`

Service này gửi request lên backend:

```typescript
async saveInteraction(interaction: UserInteractionRequest) {
    const response = await api.post("/user-interactions", [interaction]);
    return response.data;
}
```

**API Endpoint:** `POST /api/v1/user-interactions`

**Request Body:**
```json
[
    {
        "feedItemId": "690e015cd2374b02ec4c9df9",
        "userDetailId": "6910bb331da9d436ffbab8e6",
        "watchDuration": 15.5
    }
]
```

---

### 3. **UserInteractionController (Backend)**

**File:** `backend/src/main/java/com/hehe/thesocial/controller/UserInteractionController.java`

```java
@PostMapping
public ResponseEntity<ApiResponse<?>> saveInteractions(
    @RequestBody List<UserInteractionRequest> batch
) {
    userInteractionService.batchSaveUserInteraction(batch);
    return ResponseEntity.ok(ApiResponse.builder().build());
}
```

---

### 4. **UserInteractionServiceImpl (Backend)**

**File:** `backend/src/main/java/com/hehe/thesocial/service/userInteractions/UserInteractionServiceImpl.java`

#### Xử lý logic:

```java
@Transactional
public String batchSaveUserInteraction(List<UserInteractionRequest> userInteractions) {
    List<UserInteraction> interactions = userInteractions.stream().map(request -> {
        UserInteraction interaction = userInteractionMapper.toUserInteraction(request);
        
        // ✅ Tự động set interactionType = VIEW khi có watchDuration
        if (interaction.getWatchDuration() != null && interaction.getWatchDuration() > 0) {
            interaction.setInteractionType(InteractionType.VIEW);
        }
        
        // ✅ Tự động set createdAt
        if (interaction.getCreatedAt() == null) {
            interaction.setCreatedAt(LocalDateTime.now());
        }
        
        return interaction;
    }).toList();
    
    userInteractionRepository.saveAll(interactions);
    return "Success";
}
```

**Lưu ý:**
- Backend tự động set `interactionType = VIEW` khi có `watchDuration > 0`
- Backend tự động set `createdAt` nếu chưa có
- `watchPercentage` có thể được tính sau (cần video duration)

---

## 📊 Sequence Diagram

```
User                    VideoCard              UserInteractionService    Backend API
 │                           │                           │                    │
 │  ────────────────────────>│                           │                    │
 │   Video becomes active    │                           │                    │
 │   (isActive = true)       │                           │                    │
 │                           │                           │                    │
 │                           │  Start tracking           │                    │
 │                           │  watchStartTime = now()   │                    │
 │                           │                           │                    │
 │  ────────────────────────>│                           │                    │
 │   User scrolls down       │                           │                    │
 │   (isActive = false)      │                           │                    │
 │                           │                           │                    │
 │                           │  Calculate watchDuration  │                    │
 │                           │  = (now - start) / 1000  │                    │
 │                           │                           │                    │
 │                           │  ────────────────────────>│                    │
 │                           │  saveInteraction({        │                    │
 │                           │    feedItemId,            │                    │
 │                           │    userDetailId,          │                    │
 │                           │    watchDuration          │                    │
 │                           │  })                       │                    │
 │                           │                           │                    │
 │                           │                           │  POST /user-interactions
 │                           │                           │  ──────────────────>
 │                           │                           │                    │
 │                           │                           │                    │  Set interactionType = VIEW
 │                           │                           │                    │  Set createdAt = now()
 │                           │                           │                    │  Save to MongoDB
 │                           │                           │                    │
 │                           │                           │  <──────────────────
 │                           │                           │  200 OK
 │                           │  <────────────────────────│                    │
 │                           │  Success                  │                    │
 │                           │                           │                    │
```

---

## 🎯 Các trường hợp sử dụng

### Trường hợp 1: User xem video và lướt xuống

1. User mở app → VideoCard hiển thị video đầu tiên
2. `isActive = true` → Bắt đầu track: `watchStartTime = Date.now()`
3. User xem video trong 15 giây
4. User lướt xuống video tiếp theo
5. `isActive = false` → Tính `watchDuration = 15s`
6. Gửi UserInteraction lên backend:
   ```json
   {
       "feedItemId": "video-id-123",
       "userDetailId": "user-detail-id-456",
       "watchDuration": 15.0
   }
   ```
7. Backend lưu với `interactionType = VIEW`

### Trường hợp 2: User xem ImageSlide

1. User mở ImageSlidePost
2. **KHÔNG có tracking** (đúng yêu cầu)
3. User lướt xuống → Không có UserInteraction được tạo

### Trường hợp 3: User xem lại cùng một video

1. User xem video A (lần 1) → Tạo UserInteraction 1
2. User lướt lên lại video A (lần 2) → Tạo UserInteraction 2
3. Mỗi lần xem tạo một bản ghi riêng

---

## 🔍 Debug & Monitoring

### Frontend Logs

Trong VideoCard, có các log để debug:

```typescript
console.log('✅ UserInteraction saved:', {
    feedItemId: video.id,
    watchDuration: accumulatedWatchTime.current,
});
```

### Backend Logs

Trong UserInteractionServiceImpl:

```java
log.info("Save {} interaction from user detail: {} ", 
    userInteractions.size(), 
    userInteractions.get(0).getUserDetailId()
);
```

---

## ⚠️ Lưu ý quan trọng

### 1. Unique Index

Hiện tại entity có:
```java
@Indexed(unique = true)
@Field("user_detail_id")
String userDetailId;
```

**Vấn đề:** Index này chỉ cho phép 1 interaction per user, không đúng với yêu cầu (user có thể xem nhiều video).

**Giải pháp đề xuất:** Nên sửa thành composite unique index:
```java
@CompoundIndex(name = "user_feeditem_idx", def = "{'user_detail_id': 1, 'feed_item_id': 1}", unique = true)
```

Hoặc xóa unique index nếu muốn cho phép user xem lại cùng một video nhiều lần.

### 2. Watch Percentage

Hiện tại `watchPercentage` chưa được tính. Để tính được cần:
- Video duration từ FeedItem
- Công thức: `watchPercentage = (watchDuration / videoDuration) * 100`

### 3. Performance

- Frontend: Tracking được thực hiện async, không block UI
- Backend: Sử dụng batch save để tối ưu performance
- Có thể implement queue để batch nhiều interactions trước khi gửi

---

## 📝 Checklist Implementation

- [x] Tạo UserInteractionService (Frontend)
- [x] Tích hợp tracking trong VideoCard
- [x] Load userDetailId khi component mount
- [x] Track thời gian khi video active
- [x] Gửi UserInteraction khi video inactive
- [x] Backend tự động set interactionType = VIEW
- [x] Backend tự động set createdAt
- [ ] Tính watchPercentage (cần video duration)
- [ ] Sửa unique index (nếu cần)

---

## 🔗 Files liên quan

### Frontend
- `mobile-app/src/Components/Post/VideoCard.tsx` - Component chính track video
- `mobile-app/src/Services/UserInteractionService.ts` - Service gọi API
- `mobile-app/src/Services/UserDetailService.ts` - Lấy userDetailId

### Backend
- `backend/src/main/java/com/hehe/thesocial/entity/UserInteraction.java` - Entity
- `backend/src/main/java/com/hehe/thesocial/controller/UserInteractionController.java` - Controller
- `backend/src/main/java/com/hehe/thesocial/service/userInteractions/UserInteractionServiceImpl.java` - Service implementation
- `backend/src/main/java/com/hehe/thesocial/dto/request/userInteraction/UserInteractionRequest.java` - Request DTO
- `backend/src/main/java/com/hehe/thesocial/entity/enums/InteractionType.java` - Enum interaction types

---

## 📚 Tài liệu tham khảo

- MongoDB Index Documentation: https://docs.mongodb.com/manual/indexes/
- React Native useRef Hook: https://react.dev/reference/react/useRef
- Expo Video Player: https://docs.expo.dev/versions/latest/sdk/video/

---

**Last Updated:** 2025-11-19  
**Author:** Development Team

