# Hướng Dẫn Tạo Dữ Liệu Giả - Quick Start

## Tóm Tắt Cải Tiến

Script `data_manager_full.py` đã được nâng cấp với các tính năng mới:

### ✨ Tính Năng Mới

1. **Preset XLarge** - 500 videos, 100 users (quy mô production)
2. **Metadata thực tế** - Views, likes, shares được đếm từ interactions
3. **User Preferences đầy đủ** - Watched list, liked list tự động
4. **Search History** - Lịch sử tìm kiếm của người dùng
5. **Nhiều interactions hơn** - Dữ liệu phong phú hơn

## Chạy Script

### Bước 1: Mở Terminal
```bash
cd G:\Workspace\Study\HK1_2025-2026\ReactNative\Project\VideoSocialMedia\scripts
```

### Bước 2: Chạy Script
```bash
python data_manager_full.py
```

### Bước 3: Chọn Option

```
1. XLarge dataset (100 users, 500 videos, 100 image slides) ← MỚI! Quy mô lớn
2. Large dataset (50 users, 200 videos, 100 image slides)
3. Small dataset (10 users, 50 videos, 25 image slides)
4. Test dataset (10 users, 20 videos, 10 image slides) ← Nhanh nhất
5. Clear all data ← Xóa hết dữ liệu cũ
6. Exit
```

## Khuyến Nghị

### Lần Đầu Chạy
- Chọn **Option 4 (Test)** để test nhanh (2-5 phút)
- Kiểm tra xem mọi thứ hoạt động OK

### Demo/Development
- Chọn **Option 3 (Small)** - đủ dữ liệu, không quá nặng (5-10 phút)

### Production Testing
- Chọn **Option 1 (XLarge)** - 500 videos, nhiều dữ liệu (30-60 phút)

## Dữ Liệu Được Tạo

### Collections MongoDB

| Collection | XLarge | Large | Small | Test |
|------------|--------|-------|-------|------|
| users | 101 | 51 | 11 | 11 |
| videos | 500 | 200 | 50 | 20 |
| image_slides | 100 | 100 | 25 | 10 |
| feed_items | 600 | 300 | 75 | 30 |
| comments | 12,000 | 4,500 | 450 | 90 |
| interactions | 15,000+ | 5,400+ | 900+ | 180+ |
| hashtags | 50 | 30 | 10 | 5 |
| **search_history** | **1,500** | **600** | **75** | **25** |

### Dữ Liệu Mới

#### 1. Metadata Thực Tế
```javascript
{
  "_id": "...",
  "loves_count": 45,      // ← Đếm từ LIKE interactions
  "views_count": 234,     // ← Đếm từ VIEW/WATCH_COMPLETE
  "shares_count": 12,     // ← Đếm từ SHARE interactions
  "comments_count": 18    // ← Đếm từ comments
}
```

#### 2. User Preferences
```javascript
{
  "_id": "...",
  "user_detail_id": "...",
  "watched_list": ["feed_id_1", "feed_id_2", ...],  // ← Từ VIEW interactions
  "liked_list": ["feed_id_3", "feed_id_4", ...],    // ← Từ LIKE interactions
  "hashtag_scores": {},
  "creator_scores": {}
}
```

#### 3. Search History
```javascript
{
  "_id": "...",
  "user_detail_id": "...",
  "query": "dance",           // ← Hashtag, user name, hoặc common query
  "created_at": "2024-11-20T..."
}
```

## Kiểm Tra Kết Quả

### 1. MongoDB Compass
```
mongodb://admin:admin123@localhost:27017/thesocial?authSource=admin
```

Kiểm tra:
- `metadata` collection → xem views_count, loves_count
- `user_preference` collection → xem watched_list, liked_list
- `search_history` collection → xem lịch sử tìm kiếm

### 2. Backend API

Test metadata:
```bash
GET http://localhost:8082/api/v1/feed-items
```

Test search history:
```bash
GET http://localhost:8082/api/v1/search/history
```

### 3. Mobile App

Mở app và kiểm tra:
- ✅ Feed hiển thị videos/images
- ✅ Số views, likes hiển thị đúng
- ✅ Search history có dữ liệu
- ✅ Liked videos screen có dữ liệu

## Xóa Dữ Liệu Cũ

Nếu muốn tạo lại từ đầu:

```bash
python data_manager_full.py
# Chọn option 5 (Clear all data)
# Gõ "yes" để xác nhận
```

## Lưu Ý

### ⚠️ Disk Space
- **XLarge**: Cần ~5-10GB
- **Large**: Cần ~2-5GB
- **Small**: Cần ~500MB-1GB
- **Test**: Cần ~200-500MB

### ⚠️ Thời Gian
- **XLarge**: 30-60 phút
- **Large**: 15-30 phút
- **Small**: 5-10 phút
- **Test**: 2-5 phút

### ⚠️ Backend
- Backend phải đang chạy (port 8082)
- Nếu không, script vẫn chạy nhưng tạo users trực tiếp vào DB

### ⚠️ Pexels API
- Cần API key để download videos/images thật
- Không có API key → tạo placeholder files
- Get API key: https://www.pexels.com/api/

## Troubleshooting

### Script báo lỗi "No user details found"
```bash
# Tạo admin user trước
python data_manager_full.py
# Chọn option 4 (test) để tạo admin
```

### Videos không play được
```bash
# Cần Pexels API key
# Thêm vào file .env:
PEXELS_API_KEY=your_api_key_here
```

### Disk full
```bash
# Xóa uploads folder
rm -rf ../backend/uploads/*
# Hoặc chọn preset nhỏ hơn
```

## Kết Quả Mong Đợi

Sau khi chạy xong, bạn sẽ có:

✅ **500 videos** (với xlarge) hoặc tùy preset
✅ **Metadata thực tế** - views, likes, shares
✅ **User preferences** - watched, liked lists
✅ **Search history** - lịch sử tìm kiếm
✅ **Nhiều interactions** - VIEW, LIKE, COMMENT, SHARE
✅ **Comments & replies** - đầy đủ
✅ **Following relationships** - người dùng follow nhau

## Câu Hỏi Thường Gặp

**Q: Nên chọn preset nào?**
A: 
- Lần đầu → Test (nhanh)
- Development → Small (vừa đủ)
- Demo/Production → XLarge (đầy đủ)

**Q: Mất bao lâu để chạy?**
A: Test: 2-5 phút, Small: 5-10 phút, Large: 15-30 phút, XLarge: 30-60 phút

**Q: Cần bao nhiêu disk space?**
A: Test: 200MB, Small: 500MB, Large: 2-5GB, XLarge: 5-10GB

**Q: Backend có cần chạy không?**
A: Nên chạy để tạo users qua API, nhưng không bắt buộc

**Q: Pexels API key có bắt buộc không?**
A: Không, nhưng không có thì videos là placeholder (có thể không play được)

---

**Chúc bạn tạo dữ liệu thành công!** 🎉
