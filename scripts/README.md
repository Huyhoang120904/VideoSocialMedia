# Scripts Directory - Video Social Media

## 📁 Overview

This directory contains Python scripts for managing fake data generation and database operations for the Video Social Media application.

## 📄 Files

### Main Scripts

#### `data_manager_full.py` ⭐
**Complete fake data generator with all features**

Generates comprehensive fake data including:
- Users & User Details
- Videos & Image Slides
- Feed Items
- Comments & Replies
- User Interactions (VIEW, LIKE, COMMENT, SHARE)
- Hashtags
- Metadata (with real counts)
- User Preferences (watched/liked lists)
- Search History
- Following Relationships

**Presets:**
- **XLarge**: 100 users, 500 videos, 100 image slides (Production scale)
- **Large**: 50 users, 200 videos, 100 image slides
- **Small**: 10 users, 50 videos, 25 image slides
- **Test**: 10 users, 20 videos, 10 image slides (Quick test)

**Usage:**
```bash
python data_manager_full.py
```

#### `config.py`
Configuration file for database connection and API settings.

**Contains:**
- MongoDB connection URI
- Database name
- API base URL
- Server host/port
- File paths

#### `pexels_downloader.py`
Downloads real videos and images from Pexels API.

**Features:**
- Video downloads with thumbnails
- Image downloads
- Rate limiting
- Error handling

### Documentation

#### `DATA_GENERATION_IMPROVEMENTS.md`
Comprehensive documentation of all improvements made to the data generation script.

**Covers:**
- New features (XLarge preset, metadata tracking, search history)
- Data structure
- Usage instructions
- Troubleshooting

#### `HUONG_DAN_TAO_DU_LIEU.md` 🇻🇳
Quick start guide in Vietnamese for data generation.

**Includes:**
- Quick start instructions
- Preset recommendations
- Expected results
- FAQ

#### `CHANGELOG_DATA_MANAGER.md`
Detailed changelog of version 2.0 improvements.

**Documents:**
- Major features
- Technical changes
- Bug fixes
- Migration notes

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install pymongo faker requests bcrypt python-dotenv
```

### 2. Configure Environment

Create `.env` file in backend directory:
```env
MONGO_URI=mongodb://admin:admin123@localhost:27017/thesocial?authSource=admin
PEXELS_API_KEY=your_api_key_here  # Optional but recommended
```

### 3. Run Data Generation

```bash
cd scripts
python data_manager_full.py
```

### 4. Choose Preset

```
1. XLarge dataset (100 users, 500 videos) - Production scale
2. Large dataset (50 users, 200 videos)
3. Small dataset (10 users, 50 videos)
4. Test dataset (10 users, 20 videos) - Quick test
5. Clear all data
6. Exit
```

## 📊 Data Generated

### Collections Created

| Collection | Description | XLarge | Large | Small | Test |
|------------|-------------|--------|-------|-------|------|
| users | User accounts | 101 | 51 | 11 | 11 |
| user_details | User profiles | 101 | 51 | 11 | 11 |
| roles | User roles | 2 | 2 | 2 | 2 |
| files | File documents | 600 | 300 | 75 | 30 |
| videos | Video entities | 500 | 200 | 50 | 20 |
| image_slides | Image slides | 100 | 100 | 25 | 10 |
| feed_items | Feed posts | 600 | 300 | 75 | 30 |
| comments | Comments/replies | 12K | 4.5K | 450 | 90 |
| user_interactions | Interactions | 15K+ | 5.4K+ | 900+ | 180+ |
| hashtags | Hashtags | 50 | 30 | 10 | 5 |
| metadata | Post metadata | 600 | 300 | 75 | 30 |
| user_preference | User prefs | 101 | 51 | 11 | 11 |
| search_history | Search logs | 1.5K | 600 | 75 | 25 |

### Key Features

#### ✅ Real Metadata
- Views counted from VIEW/WATCH_COMPLETE interactions
- Likes counted from LIKE interactions
- Shares counted from SHARE interactions
- Comments counted from actual comments

#### ✅ User Preferences
- Watched list from actual VIEW interactions
- Liked list from actual LIKE interactions
- Automatically updated

#### ✅ Search History
- Hashtag searches
- User searches
- Common queries
- Random queries

## 🔧 Configuration

### MongoDB Connection

Default connection string:
```
mongodb://admin:admin123@localhost:27017/thesocial?authSource=admin
```

Change in `config.py` if needed.

### Pexels API

Get free API key from: https://www.pexels.com/api/

Add to `.env`:
```env
PEXELS_API_KEY=your_key_here
```

Without API key, script creates placeholder files.

## 📝 Usage Examples

### Generate Test Data (Fast)
```bash
python data_manager_full.py
# Choose option 4 (Test)
# Takes 2-5 minutes
```

### Generate Development Data
```bash
python data_manager_full.py
# Choose option 3 (Small)
# Takes 5-10 minutes
```

### Generate Production Data
```bash
python data_manager_full.py
# Choose option 1 (XLarge)
# Takes 30-60 minutes
```

### Clear All Data
```bash
python data_manager_full.py
# Choose option 5 (Clear all data)
# Type "yes" to confirm
```

## 🐛 Troubleshooting

### "No user details found"
- Ensure backend is running on port 8082
- Or run test preset first to create admin user

### "PEXELS_API_KEY not found"
- Add API key to `.env` file
- Or script will create placeholder files

### "Disk space full"
- Choose smaller preset
- Clear uploads folder: `rm -rf ../backend/uploads/*`

### Videos don't play
- Need Pexels API key for real videos
- Placeholder files may not play

## 📦 Requirements

### System Requirements
- Python 3.8+
- MongoDB 4.4+
- 5-10GB disk space (for XLarge preset)

### Python Packages
```
pymongo>=4.0.0
faker>=18.0.0
requests>=2.28.0
bcrypt>=4.0.0
python-dotenv>=1.0.0
```

Install all:
```bash
pip install -r requirements.txt
```

## 🎯 Best Practices

### For Development
1. Start with **Test preset** to verify setup
2. Use **Small preset** for daily development
3. Clear data regularly to avoid clutter

### For Demo/Testing
1. Use **Large preset** for realistic demo
2. Generate fresh data before important demos
3. Verify all features work with generated data

### For Production Testing
1. Use **XLarge preset** for stress testing
2. Monitor disk space and memory
3. Test with real Pexels videos for best results

## 🔄 Workflow

```
1. Clear old data (optional)
   ↓
2. Choose preset
   ↓
3. Script downloads/creates media files
   ↓
4. Script generates database records
   ↓
5. Script updates relationships
   ↓
6. Script updates metadata
   ↓
7. Script creates interactions
   ↓
8. Script creates search history
   ↓
9. Script shows statistics
   ↓
10. Ready to use!
```

## 📚 Additional Resources

- **Backend API**: http://localhost:8082/api/v1
- **MongoDB Compass**: mongodb://admin:admin123@localhost:27017
- **Pexels API**: https://www.pexels.com/api/

## 🆘 Support

For issues or questions:
1. Check documentation files in this directory
2. Review troubleshooting section
3. Check backend logs
4. Verify MongoDB connection

## 📄 License

Part of Video Social Media project.

---

**Happy data generation!** 🎉
