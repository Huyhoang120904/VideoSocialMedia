# Cải Tiến Data Manager - Tạo Dữ Liệu Giả Đầy Đủ

## Tổng Quan

Script `data_manager_full.py` đã được cải tiến để tạo dữ liệu giả đầy đủ và chân thực hơn cho ứng dụng Video Social Media.

## Các Cải Tiến Chính

### 1. **Preset XLarge - Quy Mô Production**
Thêm preset mới với quy mô lớn hơn nhiều:
- **100 users** (tăng từ 50)
- **500 videos** (tăng từ 200)
- **100 image slides** (giữ nguyên)
- **50 hashtags** (tăng từ 30)
- **10-30 comments/feed** (tăng từ 5-20)
- **Interactions multiplier: 5x** (tăng từ 3x)
- **40% following rate** (tăng từ 30%)
- **5-20 search history/user** (mới)

### 2. **Metadata Thực Tế**
Cập nhật metadata với số liệu thực tế từ user interactions:
- ✅ **views_count**: Đếm số lượt xem thực tế từ VIEW và WATCH_COMPLETE interactions
- ✅ **loves_count**: Đếm số lượt thích thực tế từ LIKE interactions
- ✅ **shares_count**: Đếm số lượt chia sẻ từ SHARE interactions
- ✅ **comments_count**: Đã có từ trước, cập nhật khi tạo comments

### 3. **User Preferences Đầy Đủ**
Cập nhật UserPreference với dữ liệu thực tế:
- ✅ **watched_list**: Danh sách video đã xem (từ VIEW/WATCH_COMPLETE interactions)
- ✅ **liked_list**: Danh sách video đã thích (từ LIKE interactions)
- Tự động cập nhật khi tạo interactions

### 4. **Search History**
Tạo lịch sử tìm kiếm cho người dùng:
- ✅ **Hashtag searches**: Tìm kiếm theo hashtags có sẵn
- ✅ **User searches**: Tìm kiếm theo tên người dùng
- ✅ **Common queries**: Các từ khóa phổ biến (funny videos, dance, music, etc.)
- ✅ **Random queries**: Các từ khóa ngẫu nhiên
- Số lượng search history/user tùy theo preset (0-20 entries)

### 5. **Tăng Số Lượng Interactions**
Tăng số lượng interactions để có dữ liệu phong phú hơn:
- **XLarge**: 15-50 interactions/feed (multiplier 5x)
- **Large**: 9-30 interactions/feed (multiplier 3x)
- **Small**: 6-20 interactions/feed (multiplier 2x)
- **Test**: 3-10 interactions/feed (multiplier 1x)

## Cấu Trúc Dữ Liệu

### Presets Available

| Preset | Users | Videos | Image Slides | Hashtags | Comments/Feed | Interactions | Following % | Search History/User |
|--------|-------|--------|--------------|----------|---------------|--------------|-------------|---------------------|
| **xlarge** | 100 | 500 | 100 | 50 | 10-30 | 5x | 40% | 5-20 |
| **large** | 50 | 200 | 100 | 30 | 5-20 | 3x | 30% | 3-15 |
| **small** | 10 | 50 | 25 | 10 | 2-10 | 2x | 20% | 1-10 |
| **test** | 10 | 20 | 10 | 5 | 1-5 | 1x | 10% | 0-5 |

## Cách Sử Dụng

### 1. Chạy Script

```bash
cd scripts
python data_manager_full.py
```

### 2. Chọn Option

```
Select option:
1. XLarge dataset (100 users, 500 videos, 100 image slides) - Production scale
2. Large dataset (50 users, 200 videos, 100 image slides)
3. Small dataset (10 users, 50 videos, 25 image slides)
4. Test dataset (10 users, 20 videos, 10 image slides) - Quick test
5. Clear all data
6. Exit
```

### 3. Kiểm Tra Kết Quả

Script sẽ tự động hiển thị thống kê database sau khi hoàn thành:

```
DATABASE STATISTICS
============================================================
users               :    101
user_details        :    101
roles               :      2
files               :    600
videos              :    500
image_slides        :    100
feed_items          :    600
comments            :  12000
user_interactions   :  15000
hashtags            :     50
metadata            :    600
user_preference     :    101
search_history      :   1500
============================================================
```

## Các Collections Được Tạo

1. **users**: Tài khoản người dùng
2. **user_details**: Thông tin chi tiết người dùng
3. **roles**: Vai trò (ADMIN, USER)
4. **files**: File documents (videos, images)
5. **videos**: Video entities
6. **image_slides**: Image slide entities
7. **feed_items**: Feed items (VIDEO hoặc IMAGE_SLIDE)
8. **comments**: Comments và replies
9. **user_interactions**: Interactions (VIEW, LIKE, COMMENT, SHARE, WATCH_COMPLETE)
10. **hashtags**: Hashtags
11. **metadata**: Metadata (views, loves, comments, shares counts)
12. **user_preference**: User preferences (watched_list, liked_list)
13. **search_history**: Lịch sử tìm kiếm

## Lưu Ý Quan Trọng

### 1. Pexels API Key
- Để download video/image thật từ Pexels, cần có API key
- Thêm `PEXELS_API_KEY` vào file `.env`
- Nếu không có API key, script sẽ tạo placeholder files

### 2. Backend Running
- Backend phải đang chạy để tạo users qua API
- Nếu backend không chạy, script sẽ tạo users trực tiếp vào database

### 3. Disk Space
- **XLarge preset** cần ~5-10GB disk space cho videos/images
- Script tự động cleanup temporary files sau khi hoàn thành

### 4. Thời Gian Chạy
- **Test**: ~2-5 phút
- **Small**: ~5-10 phút
- **Large**: ~15-30 phút
- **XLarge**: ~30-60 phút (tùy tốc độ download)

## Kiểm Tra Dữ Liệu

### 1. MongoDB Compass
Kết nối đến MongoDB và kiểm tra các collections:
```
mongodb://admin:admin123@localhost:27017/thesocial?authSource=admin
```

### 2. Backend API
Kiểm tra qua API endpoints:
- `GET /api/v1/feed-items` - Xem feed items
- `GET /api/v1/user-details/me` - Xem user details
- `GET /api/v1/search/posts?query=dance` - Test search
- `GET /api/v1/search/users?query=user` - Test user search

### 3. Mobile App
Mở app và kiểm tra:
- Feed có videos/images
- Metadata hiển thị đúng (views, likes)
- Search history hoạt động
- User preferences (watched, liked lists)

## Troubleshooting

### Lỗi: "No user details found"
- Đảm bảo backend đang chạy
- Hoặc tạo admin user trước: `python data_manager_full.py` → chọn option 4 (test)

### Lỗi: "PEXELS_API_KEY not found"
- Thêm API key vào `.env` file
- Hoặc script sẽ tạo placeholder files (có thể không play được)

### Lỗi: "Disk space full"
- Giảm preset size (chọn small hoặc test)
- Xóa folder `backend/uploads` trước khi chạy lại

## Tính Năng Mới So Với Phiên Bản Cũ

| Tính Năng | Cũ | Mới |
|-----------|-----|-----|
| Max videos | 200 | **500** |
| Max users | 50 | **100** |
| Metadata views/loves | ❌ Không có | ✅ **Có thực tế** |
| User watched list | ⚠️ Random | ✅ **Từ interactions** |
| User liked list | ❌ Không có | ✅ **Từ interactions** |
| Search history | ❌ Không có | ✅ **Có đầy đủ** |
| Interactions/feed | 1-15 | **15-50** |
| Presets | 3 | **4 (thêm xlarge)** |

## Kết Luận

Script đã được cải tiến toàn diện để tạo dữ liệu giả chân thực và đầy đủ hơn, phục vụ tốt cho việc testing và demo ứng dụng ở quy mô production.

**Các cải tiến chính:**
1. ✅ Thêm preset XLarge (500 videos, 100 users)
2. ✅ Metadata với views/loves thực tế
3. ✅ User preferences với watched/liked lists
4. ✅ Search history đầy đủ
5. ✅ Tăng số lượng interactions

**Sẵn sàng cho production testing!** 🚀
