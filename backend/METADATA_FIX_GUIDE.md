# 🔧 Fix Metadata Loading - Implementation Guide

## 📋 Vấn đề đã fix

**Trước đây:** FeedItems không load được `metadata` (bao gồm `loveCount`, `loveBys`) khi fetch từ database vì MongoDB không tự động populate `@DBRef`.

**Giải pháp:** Sử dụng MongoDB Aggregation với `$lookup` để join metadata trong cùng 1 query.

---

## ✅ Changes Made

### 1. **FeedItemRepository.java** - Thêm Custom Aggregation Query

```java
@Aggregation(pipeline = {
    "{ $lookup: { from: 'metadata', localField: 'metadata_ref.$id', foreignField: '_id', as: 'metaData' } }",
    "{ $unwind: { path: '$metaData', preserveNullAndEmptyArrays: true } }",
    "{ $skip: ?#{#pageable.offset} }",
    "{ $limit: ?#{#pageable.pageSize} }"
})
Page<FeedItem> findAllWithMetadata(Pageable pageable);
```

**Giải thích:**
- `$lookup`: Join collection `metadata` với `feed_items`
- `localField: 'metadata_ref.$id'`: Field trong feed_items (DBRef object)
- `foreignField: '_id'`: Field _id trong metadata collection
- `$unwind`: Convert array result thành single object
- `preserveNullAndEmptyArrays: true`: Giữ lại feedItems không có metadata
- `$skip` và `$limit`: Hỗ trợ pagination

### 2. **FeedServiceImpl.java** - Sử dụng method mới

**Trước:**
```java
Page<FeedItem> feedItems = feedItemRepository.findAll(pageable);
```

**Sau:**
```java
Page<FeedItem> feedItems = feedItemRepository.findAllWithMetadata(pageable);
```

**Thêm logging:**
```java
if (feedItem.getMetaData() != null) {
    log.debug("FeedItem {} has metadata: loveCount={}", 
        feedItem.getId(), feedItem.getMetaData().getLoveCount());
    if (feedItem.getMetaData().getLoveCount() != null) {
        likeCount = feedItem.getMetaData().getLoveCount();
    }
} else {
    log.warn("FeedItem {} has NO metadata!", feedItem.getId());
}
```

---

## 🗄️ Database Migration (Required)

**Đảm bảo tất cả FeedItems có metadata:**

### Bước 1: Kết nối MongoDB
```bash
# Nếu dùng Docker
docker exec -it <mongo-container-name> mongosh

# Hoặc
mongosh "mongodb://localhost:27017"
```

### Bước 2: Chọn database
```javascript
use thesocial
```

### Bước 3: Kiểm tra FeedItems không có metadata
```javascript
db.feed_items.countDocuments({ metadata_ref: { $exists: false } })
```

### Bước 4: Tạo metadata cho FeedItems chưa có
```javascript
db.feed_items.find({ metadata_ref: { $exists: false } }).forEach(function(feedItem) {
  // Tạo metadata mới với count mặc định
  var newMetadata = {
    loves_count: NumberLong(0),
    comments_count: NumberLong(0),
    views_count: NumberLong(0),
    shares_count: NumberLong(0)
  };
  
  var metadataId = db.metadata.insertOne(newMetadata).insertedId;
  
  // Update feedItem với metadata_ref
  db.feed_items.updateOne(
    { _id: feedItem._id },
    { $set: { metadata_ref: metadataId } }
  );
  
  print("Created metadata for FeedItem: " + feedItem._id);
});
```

### Bước 5: Đảm bảo lovedBy field tồn tại
```javascript
db.feed_items.updateMany(
  { loved_by: { $exists: false } },
  { $set: { loved_by: [] } }
)
```

### Bước 6: Verify
```javascript
print("Total FeedItems: " + db.feed_items.countDocuments({}));
print("FeedItems with metadata: " + db.feed_items.countDocuments({ metadata_ref: { $exists: true } }));
print("FeedItems with lovedBy: " + db.feed_items.countDocuments({ loved_by: { $exists: true } }));
```

---

## 🧪 Testing

### Test API Response
```bash
curl -X GET http://localhost:8080/api/feed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "result": {
    "content": [
      {
        "id": "...",
        "feedItemType": "VIDEO",
        "likeCount": 5,        // ✅ Bây giờ có giá trị từ metadata
        "commentCount": 3,
        "shareCount": 0,
        "loved": true,         // ✅ Check từ lovedBy
        "video": { ... }
      }
    ]
  }
}
```

### Check Logs
```
DEBUG FeedServiceImpl - Converting FeedItem: 690d8afad2f130421599a66f
DEBUG FeedServiceImpl - FeedItem 690d8afad2f130421599a66f has metadata: loveCount=5
```

**Nếu thấy:**
```
WARN  FeedServiceImpl - FeedItem 690d8afad2f130421599a66f has NO metadata!
```
➡️ Cần chạy migration script ở trên!

---

## 📊 Performance Impact

### Before (2 queries per item):
1. Query feed_items
2. Query metadata (for each item)

**Total:** 1 + N queries (N-1 problem)

### After (1 query with join):
1. Query feed_items WITH metadata (using $lookup)

**Total:** 1 query only ✅

**Improvement:** 
- Giảm N-1 queries
- Faster response time
- Better scalability

---

## 🔍 Troubleshooting

### Problem: `likeCount` vẫn là 0
**Solution:** 
1. Check logs xem có load metadata không
2. Verify database có metadata_ref
3. Chạy migration script

### Problem: Build error
**Solution:**
```bash
.\mvnw.cmd clean compile -DskipTests
```

### Problem: MongoDB connection
**Solution:**
Check `application.yml`:
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/thesocial
```

---

## 📝 Next Steps

1. ✅ Build backend: `.\mvnw.cmd compile`
2. ✅ Run migration script trong MongoDB
3. ✅ Start backend: `.\mvnw.cmd spring-boot:run`
4. ✅ Test API endpoint
5. ✅ Verify mobile app hiển thị đúng loveCount

---

## 🎯 Summary

- **Root Cause:** MongoDB không tự động populate `@DBRef` references
- **Solution:** Custom Aggregation Query với `$lookup`
- **Benefits:** 
  - ✅ Single query (no N+1 problem)
  - ✅ Better performance
  - ✅ Scalable solution
- **Migration Required:** Đảm bảo tất cả FeedItems có metadata_ref

**Status:** ✅ Implementation Complete - Ready for Testing
