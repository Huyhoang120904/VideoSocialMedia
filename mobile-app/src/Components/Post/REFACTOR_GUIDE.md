# Video Feed Components - Refactored Architecture

## 📋 Tổng quan

Đã refactor lại toàn bộ giao diện màn hình recommendation feed theo phong cách TikTok với:
- ✅ **Responsive chuẩn** - Tự động scale theo màn hình
- ✅ **Component structure rõ ràng** - Dễ maintain và extend
- ✅ **Performance optimized** - Memo, lazy animations
- ✅ **Modern UI/UX** - Flat design, smooth animations
- ✅ **Dark mode ready** - Theme system hoàn chỉnh

## 🏗️ Cấu trúc Component

### 1. Core Components

#### **VideoCard** (`VideoCard.tsx`)
Component chính hiển thị video với đầy đủ controls và overlays.

**Props:**
```typescript
interface VideoCardProps {
  video: VideoData;        // Video data object
  isActive: boolean;       // Video có đang được view không
  itemHeight?: number;     // Chiều cao custom (optional)
  onFollowPress?: () => void;  // Callback khi follow
  isFollowing?: boolean;   // Trạng thái follow
}
```

**Features:**
- Full-screen video player (9:16 ratio)
- Play/pause với tap gesture
- Progress bar với drag control
- Time indicators
- Auto-play/pause based on visibility
- Smooth animations

---

#### **InteractionBar** (`InteractionBar.tsx`)
Thanh tương tác bên phải màn hình (like, comment, share, bookmark).

**Props:**
```typescript
interface InteractionBarProps {
  id: string;              // Feed item ID
  likes: number;           // Số lượt like
  comments: number;        // Số lượt comment
  shares: number;          // Số lượt share
  outstanding: number;     // Số lượt bookmark
  feedItemType: 'VIDEO' | 'IMAGE_SLIDE';
  avatarUrl?: string;      // URL avatar
  onFollowPress?: () => void;
  isFollowing?: boolean;
}
```

**Features:**
- Avatar với nút follow
- Like button với animation
- Comment modal integration
- Bookmark functionality
- Share button
- Rotating music disc

**Sub-components:**
- `ActionButton` - Reusable interaction button
- `UserAvatar` - Profile picture với follow button

---

#### **UserInfoSection** (`UserInfoSection.tsx`)
Thông tin user và caption ở góc dưới trái.

**Props:**
```typescript
interface UserInfoSectionProps {
  username?: string;       // Tên user
  title?: string;          // Tiêu đề video
  description?: string;    // Caption/mô tả
  musicName?: string;      // Tên nhạc
  onUsernamePress?: () => void;
}
```

**Features:**
- Username clickable
- Expandable caption
- Auto-scrolling text cho caption dài
- Music tag với icon
- Fade-in animation

**Sub-components:**
- `MusicTag` - Music/sound info display

---

### 2. Utility Files

#### **responsive.ts** (`Utils/responsive.ts`)
Hệ thống responsive utilities.

**Functions:**
```typescript
scaleWidth(size)         // Scale theo width
scaleHeight(size)        // Scale theo height
scaleFontSize(size)      // Scale font với pixel ratio
moderateScale(size, factor)  // Scale vừa phải cho padding/margin
```

**Constants:**
```typescript
spacing     // Responsive spacing (tiny → xxxlarge)
fontSizes   // Responsive fonts (tiny → xxxlarge)
iconSizes   // Responsive icons (tiny → xxlarge)
dimensions  // Screen dimensions, avatar sizes, etc.
animations  // Duration constants
```

**Helpers:**
```typescript
getTabBarHeight()       // Tính chiều cao tab bar
getBottomPosition()     // Tính vị trí bottom cho components
getDeviceType()         // 'small' | 'medium' | 'large'
hasNotch()             // Check device có notch không
```

---

#### **theme.ts** (`constants/theme.ts`)
Theme system với colors, typography, layout constants.

**Structure:**
```typescript
colors: {
  primary, background, text, icon, social, progressBar, border
}

typography: {
  fontFamily, fontSize, lineHeight, fontWeight
}

layout: {
  spacing, dimensions, borderRadius, shadow, zIndex
}

componentSizes: {
  avatar, icon, button, progressBar, musicDisc, plusIcon
}

animationTimings: {
  duration, easing, spring configs
}

opacity: {
  disabled, inactive, semiVisible, mostlyVisible, visible
}
```

---

## 📐 Layout Structure

```
┌─────────────────────────────────────┐
│         Status Bar (safe area)      │
├─────────────────────────────────────┤
│                                     │
│                                     │ ┐
│         VIDEO FULL SCREEN           │ │
│           (9:16 ratio)              │ │ VideoCard
│                                     │ │
│                                     │ │
│  ┌──────────────┐      ┌─────┐    │ │
│  │ UserInfo     │      │Inter│    │ │
│  │ Section      │      │action│    │ │
│  │ - Username   │      │Bar  │    │ │
│  │ - Caption    │      │     │    │ │
│  │ - MusicTag   │      └─────┘    │ │
│  └──────────────┘                  │ ┘
├─────────────────────────────────────┤
│      Bottom Tab Navigator           │
└─────────────────────────────────────┘
```

**Z-index Layers:**
- 0: Background (video)
- 10: Content (UserInfoSection)
- 20: Overlay (pause icon)
- 30: Controls (progress bar, tap area)
- 40: Interaction (InteractionBar)
- 50: Modal (comments)

---

## 🎨 Styling Principles

### 1. Responsive Design
- **Base dimensions:** iPhone 12/13 (390x844)
- **Auto-scaling:** Tất cả sizes scale theo màn hình
- **Safe areas:** Tính toán notch, status bar, tab bar

### 2. Typography
```typescript
fontSizes.tiny: 10px    → scaleFontSize(10)
fontSizes.small: 12px   → scaleFontSize(12)
fontSizes.medium: 14px  → scaleFontSize(14)
fontSizes.large: 16px   → scaleFontSize(16)
```

### 3. Spacing System
```typescript
spacing.tiny: 4px       → moderateScale(4)
spacing.small: 8px      → moderateScale(8)
spacing.medium: 12px    → moderateScale(12)
spacing.large: 16px     → moderateScale(16)
spacing.xlarge: 24px    → moderateScale(24)
```

### 4. Colors
- **Primary:** `#FF0050` (TikTok pink)
- **Background:** `#000000` (Black)
- **Text:** White với opacity levels
- **Icons:** White default, colored khi active

---

## 🚀 Usage Examples

### Basic Video Feed
```tsx
import VideoCard from './Components/Post/VideoCard';

<VideoCard
  video={{
    id: '123',
    uri: 'https://video.mp4',
    title: 'Amazing video!',
    description: 'Check this out',
    likes: 1200,
    comments: 45,
    shares: 30,
    outstanding: 89,
    username: 'john_doe',
    avatarUrl: 'https://avatar.jpg',
  }}
  isActive={true}
/>
```

### Custom Interaction Bar
```tsx
import InteractionBar from './Components/Post/InteractionBar';

<InteractionBar
  id="123"
  likes={1200}
  comments={45}
  shares={30}
  outstanding={89}
  feedItemType="VIDEO"
  onFollowPress={() => console.log('Follow!')}
/>
```

### Standalone User Info
```tsx
import UserInfoSection from './Components/Post/UserInfoSection';

<UserInfoSection
  username="john_doe"
  title="Amazing video!"
  description="Long description here..."
  musicName="Original Sound"
  onUsernamePress={() => navigateToProfile()}
/>
```

---

## 🔧 Customization

### Thay đổi Colors
Edit `constants/theme.ts`:
```typescript
export const colors = {
  primary: '#YOUR_COLOR',
  // ...
}
```

### Thay đổi Spacing
Edit `Utils/responsive.ts`:
```typescript
export const spacing = {
  small: moderateScale(10), // Từ 8 → 10
  // ...
}
```

### Custom Animation Duration
```typescript
import { theme } from './constants/theme';

Animated.timing(value, {
  duration: theme.animationTimings.duration.slow,
  // ...
})
```

---

## 🎯 Performance Tips

### 1. Use React.memo
VideoCard đã được wrap với `memo()` để tránh re-render không cần thiết.

### 2. Optimize Video Loading
```tsx
// Only play video when active
<VideoCard isActive={index === currentIndex} />
```

### 3. Lazy Load Comments
Comment modal chỉ load khi user mở.

### 4. Animation Best Practices
- Sử dụng `useNativeDriver: true` cho transform/opacity
- Stop animations khi component unmount
- Sử dụng spring animations cho natural feel

---

## 📱 Responsive Breakpoints

| Device Type | Width Range | Adjustments |
|-------------|-------------|-------------|
| Small       | < 375px     | Smaller fonts, reduced spacing |
| Medium      | 375-430px   | Standard sizes (base) |
| Large       | > 430px     | Slightly larger elements |

**Auto-detection:**
```typescript
const deviceType = getDeviceType(); // 'small' | 'medium' | 'large'
```

---

## 🌙 Dark Mode Support

Theme system đã sẵn sàng cho dark/light mode:

```typescript
import { darkTheme, lightTheme } from './constants/theme';

const currentTheme = isDarkMode ? darkTheme : lightTheme;
```

---

## 🔄 Migration từ Code Cũ

### Old Structure
```
Post/
  index.tsx         → VideoCard.tsx (refactored)
  RightVideo.tsx    → InteractionBar.tsx (new)
  BottomVideo.tsx   → UserInfoSection.tsx (new)
  styles.tsx        → Deprecated (use theme.ts)
```

### Breaking Changes
1. `Post` component → `VideoCard`
2. Props structure thay đổi (thêm username, avatarUrl, musicName)
3. Styles không còn dùng `styles.tsx` cũ
4. Import từ `responsive.ts` và `theme.ts`

### Migration Steps
1. ✅ Update imports trong `FeedPost.tsx`
2. ⏳ TODO: Add user info to FeedItem type
3. ⏳ TODO: Integrate music data from backend
4. ⏳ TODO: Add follow functionality

---

## 🐛 Known Issues & Todos

- [ ] Add user info to FeedItem type (backend)
- [ ] Implement share functionality
- [ ] Add haptic feedback on interactions
- [ ] Implement lazy loading for videos
- [ ] Add gesture recognizer for swipe up/down
- [ ] Double-tap to like animation
- [ ] Video caching strategy
- [ ] Accessibility improvements

---

## 📚 Dependencies

```json
{
  "expo-video": "^1.x.x",
  "@expo/vector-icons": "^14.x.x",
  "react-native-safe-area-context": "^4.x.x",
  "react-redux": "^8.x.x"
}
```

---

## 🤝 Contributing

Khi thêm component mới:
1. Sử dụng responsive utilities từ `responsive.ts`
2. Lấy colors/spacing từ `theme.ts`
3. Tuân theo naming convention
4. Add TypeScript types
5. Wrap với `memo()` nếu cần
6. Test trên nhiều kích thước màn hình

---

## 📞 Support

Nếu có vấn đề hoặc câu hỏi:
- Check console logs cho debug info
- Review component props trong React DevTools
- Test responsive trên simulator/emulator khác nhau

---

**Version:** 2.0.0  
**Last Updated:** November 6, 2025  
**Author:** Video Social Media Team
