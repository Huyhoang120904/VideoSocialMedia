# Component Architecture Diagram

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                  Status Bar (Safe Area)                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│                                                           │
│                   VIDEO PLAYER                           │
│              (Full Screen 9:16)                          │
│                                                           │
│              ┌──────────────────┐                        │
│              │  Play/Pause Icon │                        │
│              │   (Overlay)      │                        │
│              └──────────────────┘                        │
│                                                           │
│  ┌────────────────────────┐              ┌────────┐     │
│  │ UserInfoSection        │              │Inter-  │     │
│  │                        │              │action  │     │
│  │ • @username            │              │Bar     │     │
│  │ • Title/Caption        │              │        │     │
│  │ • Description          │              │ 👤     │     │
│  │ • 🎵 Music Tag         │              │ Avatar │     │
│  └────────────────────────┘              │        │     │
│                                           │ ❤️ 1.2K │     │
│  [Progress Bar ═══════●────]             │ 💬 45  │     │
│                                           │ 🔖 89  │     │
│                                           │ 📤 30  │     │
│                                           │ 🎵     │     │
│                                           └────────┘     │
├─────────────────────────────────────────────────────────┤
│              Bottom Tab Navigator                        │
└─────────────────────────────────────────────────────────┘
```

## 🏗️ Component Hierarchy

```
VideoCard (Main Container)
├── VideoView (expo-video player)
│   ├── Video Player Core
│   └── Content Fit: cover
│
├── Play/Pause Control
│   ├── Center Tap Area (Pressable)
│   └── Animated Icon Overlay
│       └── FontAwesome6 Icon
│
├── Progress Bar Section
│   ├── Time Indicators (MM:SS)
│   ├── Progress Background
│   ├── Progress Fill
│   └── Draggable Thumb
│
├── InteractionBar (Right Side)
│   ├── UserAvatar
│   │   ├── Image
│   │   └── Follow Button (+)
│   │
│   ├── ActionButton (Like)
│   │   ├── Heart Icon (animated)
│   │   └── Count (1.2K)
│   │
│   ├── ActionButton (Comment)
│   │   ├── Chat Icon
│   │   └── Count (45)
│   │
│   ├── ActionButton (Bookmark)
│   │   ├── Bookmark Icon
│   │   └── Count (89)
│   │
│   ├── ActionButton (Share)
│   │   ├── Share Icon
│   │   └── Count (30)
│   │
│   ├── Music Disc (Rotating)
│   │   └── Animated Image
│   │
│   └── VideoCommentModal
│       └── (Lazy loaded)
│
└── UserInfoSection (Bottom Left)
    ├── Username (@user)
    ├── Title/Caption (expandable)
    ├── Description (auto-scroll)
    └── MusicTag
        ├── Musical Note Icon
        └── Music Name
```

## 🎨 Z-Index Layers

```
Layer 100: Toast/Notifications
Layer 50:  Modal (Comments)
Layer 40:  InteractionBar (right sidebar)
Layer 30:  Controls (progress bar, tap area)
Layer 20:  Overlay (pause icon background)
Layer 10:  Content (UserInfoSection)
Layer 0:   Background (VideoView)
```

## 🔄 Data Flow

```
Home Screen
    ↓
FeedPost
    ↓
VideoCard (Main)
    ├→ InteractionBar
    │   ├→ ActionButton (x4)
    │   ├→ UserAvatar
    │   └→ VideoCommentModal
    │
    └→ UserInfoSection
        ├→ Username
        ├→ Caption
        └→ MusicTag
```

## 📦 File Dependencies

```
VideoCard.tsx
├── imports
│   ├── expo-video (VideoView, useVideoPlayer)
│   ├── @expo/vector-icons (FontAwesome6)
│   ├── react-native-safe-area-context
│   ├── theme.ts (colors, spacing, etc.)
│   ├── responsive.ts (dimensions)
│   ├── InteractionBar.tsx
│   └── UserInfoSection.tsx
│
InteractionBar.tsx
├── imports
│   ├── @expo/vector-icons (AntDesign, Ionicons, etc.)
│   ├── redux (updateVideo)
│   ├── theme.ts
│   ├── responsive.ts (getBottomPosition)
│   ├── ActionButton.tsx
│   ├── UserAvatar.tsx
│   └── VideoCommentModal.tsx
│
UserInfoSection.tsx
├── imports
│   ├── theme.ts
│   ├── responsive.ts (getBottomPosition)
│   └── MusicTag.tsx
│
ActionButton.tsx
├── imports
│   ├── theme.ts
│   └── Animated (spring animation)
│
UserAvatar.tsx
├── imports
│   ├── theme.ts
│   ├── @expo/vector-icons (MaterialCommunityIcons)
│   └── ActionButton.tsx
│
MusicTag.tsx
├── imports
│   ├── theme.ts
│   └── @expo/vector-icons (Ionicons)
```

## 🎯 Responsive System

```
responsive.ts
├── scaleWidth(size)
│   └── Based on screen width
│
├── scaleHeight(size)
│   └── Based on screen height
│
├── scaleFontSize(size)
│   └── Based on width + pixel ratio
│
├── moderateScale(size, factor)
│   └── Smart scaling for spacing
│
├── Constants
│   ├── spacing (tiny → xxxlarge)
│   ├── fontSizes (tiny → xxxlarge)
│   ├── iconSizes (tiny → xxlarge)
│   └── dimensions (screen, avatar, etc.)
│
└── Helpers
    ├── getTabBarHeight()
    ├── getBottomPosition()
    ├── getDeviceType()
    └── hasNotch()
```

## 🎨 Theme System

```
theme.ts
├── colors
│   ├── primary (#FF0050)
│   ├── background (dark/light)
│   ├── text (primary/secondary/tertiary)
│   ├── icon (default/active/inactive)
│   └── social (like/comment/share/bookmark)
│
├── typography
│   ├── fontFamily (regular/medium/semiBold/bold)
│   ├── fontSize (from responsive.ts)
│   ├── lineHeight (tight/normal/relaxed)
│   └── fontWeight (400/500/600/700)
│
├── layout
│   ├── spacing (from responsive.ts)
│   ├── dimensions (from responsive.ts)
│   ├── borderRadius (small/medium/large/circle)
│   ├── shadow (small/medium/large)
│   └── zIndex (0-100)
│
├── componentSizes
│   ├── avatar (small/medium/large)
│   ├── icon (tiny → xxlarge)
│   ├── button (small/medium/large)
│   ├── progressBar (height/thumb)
│   └── musicDisc (size/border)
│
└── animationTimings
    ├── duration (fast/normal/slow/verySlow)
    ├── easing (linear/easeIn/easeOut/easeInOut)
    └── spring (gentle/standard/bouncy)
```

## 🔄 Animation Flow

```
Like Button Animation
├── Press
│   ├── Scale: 1 → 0.85 (spring)
│   └── Release
│       └── Scale: 0.85 → 1.4 → 1 (spring)
│
Play/Pause Animation
├── Tap
│   ├── Show controls
│   │   ├── Opacity: 0 → 1 (timing)
│   │   └── Scale: 0 → 1 (spring)
│   │
│   └── Auto-hide after 1.5s
│       ├── Opacity: 1 → 0 (timing)
│       └── Scale: 1 → 0 (timing)
│
Music Disc Rotation
└── Loop (3s per rotation)
    └── Rotate: 0deg → 360deg (timing)

Auto-scroll Text
├── Delay 2s
├── Scroll left (3s)
├── Delay 1s
└── Scroll back (1s)
```

## 📱 Responsive Breakpoints

```
Device Detection
├── Small (< 375px)
│   ├── Smaller fonts
│   ├── Reduced spacing
│   └── Compact layout
│
├── Medium (375-430px) [BASE]
│   ├── Standard sizes
│   ├── Normal spacing
│   └── Default layout
│
└── Large (> 430px)
    ├── Slightly larger fonts
    ├── More spacing
    └── Expanded layout
```

---

**Legend:**
- 📦 Component
- 🎨 Style/Theme
- 🔄 Data Flow
- 📐 Layout
- 🎯 Logic/Function
