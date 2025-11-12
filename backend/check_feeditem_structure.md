# Kiểm tra cấu trúc FeedItem trong MongoDB

## Các bước kiểm tra:

### 1. Kết nối MongoDB
```bash
# Nếu dùng Docker
docker exec -it <mongo-container-name> mongosh

# Hoặc kết nối trực tiếp
mongosh "mongodb://localhost:27017"
```

### 2. Chọn database
```javascript
use thesocial  // Hoặc tên database của bạn
```

### 3. Kiểm tra 1 FeedItem mẫu
```javascript
db.feed_items.findOne()
```

### 4. Kiểm tra field lovedBy và metadata_ref
```javascript
db.feed_items.findOne(
  {}, 
  { _id: 1, loved_by: 1, metadata_ref: 1, feed_item_type: 1 }
)
```

### 5. Kiểm tra MetaData
```javascript
db.metadata.findOne()
```

### 6. Đếm số FeedItem có lovedBy
```javascript
db.feed_items.countDocuments({ loved_by: { $exists: true } })
```

### 7. Đếm số FeedItem có metadata_ref
```javascript
db.feed_items.countDocuments({ metadata_ref: { $exists: true } })
```

## Migration Script (nếu cần)

### Thêm field lovedBy cho tất cả FeedItem
```javascript
db.feed_items.updateMany(
  { loved_by: { $exists: false } },
  { $set: { loved_by: [] } }
)
```

### Thêm MetaData cho FeedItem chưa có
```javascript
// Tạo metadata mặc định
db.feed_items.find({ metadata_ref: { $exists: false } }).forEach(function(feedItem) {
  // Tạo metadata mới
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
});
```

### Kiểm tra lại sau khi migration
```javascript
// Kiểm tra FeedItem
db.feed_items.findOne({}, { loved_by: 1, metadata_ref: 1 })

// Kiểm tra counts
print("FeedItems with lovedBy: " + db.feed_items.countDocuments({ loved_by: { $exists: true } }));
print("FeedItems with metadata: " + db.feed_items.countDocuments({ metadata_ref: { $exists: true } }));
print("Total FeedItems: " + db.feed_items.countDocuments({}));
```

## Kiểm tra sau khi Like một video

### 1. Like video với ID cụ thể (từ UI)
Sử dụng UI để like video với ID: `690d8afad2f130421599a66f`

### 2. Kiểm tra FeedItem
```javascript
db.feed_items.findOne(
  { _id: ObjectId("690d8afad2f130421599a66f") },
  { loved_by: 1, metadata_ref: 1 }
)
```

### 3. Kiểm tra MetaData
```javascript
// Lấy metadata_ref từ kết quả trên, ví dụ: ObjectId("abc123...")
var feedItem = db.feed_items.findOne({ _id: ObjectId("690d8afad2f130421599a66f") });
if (feedItem && feedItem.metadata_ref) {
  db.metadata.findOne({ _id: feedItem.metadata_ref });
}
```

### 4. Kiểm tra logs backend
Xem log trong console backend để xác nhận:
- Update result matched count
- Update result modified count
- LoveCount before and after

## Expected Results

Sau khi like thành công:
- `loved_by` array phải chứa userDetailId
- `metadata.loves_count` phải tăng lên 1
