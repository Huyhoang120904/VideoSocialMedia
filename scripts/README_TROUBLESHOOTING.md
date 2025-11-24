# Troubleshooting Guide

## Lỗi 404 khi load video mới upload

### Vấn đề:
- Feed item tồn tại trong database
- Backend không tìm thấy feed item (404 error)
- Error: "Feed item not found!"

### Nguyên nhân có thể:

1. **Backend đang kết nối tới database khác**
   - Script tạo data trong Docker MongoDB
   - Backend kết nối tới standalone MongoDB (hoặc ngược lại)
   - **Giải pháp**: Đảm bảo backend và script dùng cùng MongoDB instance

2. **Feed item được tạo nhưng chưa được index**
   - MongoDB chưa index collection
   - **Giải pháp**: Restart backend để tạo indexes

3. **Format ObjectId không đúng**
   - Feed item có `_id` là ObjectId nhưng query bằng string
   - **Giải pháp**: Spring Data MongoDB tự động convert, nhưng cần đảm bảo format đúng

### Cách kiểm tra:

1. **Kiểm tra MongoDB connection:**
```bash
# Check script database
python scripts\check_feed_item.py

# Check backend database (via API)
python scripts\test_feed_item_api.py
```

2. **Kiểm tra backend .env:**
```bash
# Backend .env should have:
MONGODB_URL=mongodb://superadmin:123456@localhost:27017/thesocial?authSource=admin
```

3. **Kiểm tra MongoDB instance:**
```bash
# Check if Docker MongoDB is running
docker ps | grep mongodb

# Check if standalone MongoDB is running
net start MongoDB
```

### Giải pháp:

1. **Đảm bảo cùng MongoDB:**
   - Nếu dùng Docker: `docker-compose up -d` trong `backend/`
   - Nếu dùng standalone: Đảm bảo service đang chạy
   - Kiểm tra `MONGODB_URL` trong backend `.env` giống với script

2. **Clear và tạo lại data:**
```bash
python scripts\data_manager_full.py
# Chọn option 4: Clear all data
# Sau đó chọn option 3: Test dataset
```

3. **Restart backend:**
   - Restart backend để refresh connection và indexes

### Lưu ý:

- Feed items được tạo với `_id` là ObjectId (tự động)
- Backend query bằng string ID, Spring Data MongoDB tự động convert
- Nếu vẫn lỗi, có thể backend đang kết nối tới database khác

