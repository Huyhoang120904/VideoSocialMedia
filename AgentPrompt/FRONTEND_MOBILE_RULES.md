# Mobile Frontend Development Rules (React Native)

> **Version**: 1.0
> **Last Updated**: 2025-01-27
> **Owner**: Mobile Team

## Table of Contents

- [Project Structure](#project-structure)
- [Naming Conventions](#naming-conventions)
- [State Management](#state-management)
- [Navigation](#navigation)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Performance Optimization](#performance-optimization)
- [Testing](#testing)

## Project Structure

```
src/
├── Components/              # Reusable components
│   ├── Comment/
│   ├── Conversation/
│   ├── Inbox/
│   ├── Post/
│   ├── Upload/
│   └── UserItem/
├── Context/                # Context providers
│   ├── AuthProvider.tsx
│   ├── ConversationProvider.tsx
│   ├── ChatMessageProvider.tsx
│   └── SocketProvider.tsx
├── Navigation/              # Navigation configuration
│   ├── index.tsx
│   ├── homeBottomTabNavigation.tsx
│   └── topVideoTabNavigation.tsx
├── Srceens/                 # Screen components
│   ├── Login/
│   ├── Home/
│   ├── Profile/
│   └── ...
├── Services/                # API services
│   ├── AuthService.ts
│   ├── HttpClient.ts
│   ├── VideoService.ts
│   └── ...
├── Types/                   # TypeScript types
│   ├── request/
│   ├── response/
│   └── ApiResponse.ts
├── Utils/                   # Utility functions
│   ├── FormDataHelper.ts
│   └── ImageUrlHelper.ts
└── Store/                   # Redux store
    └── videoSlice.tsx
```

## Naming Conventions

### Files and Folders

| Type              | Pattern                       | Example                 |
| ----------------- | ----------------------------- | ----------------------- |
| Component Files   | `PascalCase.tsx`              | `LoginScreen.tsx`       |
| Screen Folders    | `PascalCase/`                 | `Login/`, `Profile/`    |
| Component Folders | `PascalCase/`                 | `Comment/`, `UserItem/` |
| Service Files     | `*Service.ts`                 | `AuthService.ts`        |
| Utility Files     | `*Helper.ts`                  | `FormDataHelper.ts`     |
| Type Files        | `*Request.ts`, `*Response.ts` | `LoginRequest.ts`       |

### Components

```typescript
// Screen component
export default function LoginScreen() {
  // ...
}

// Reusable component
export const UserItem: React.FC<UserItemProps> = ({ user }) => {
  // ...
};
```

### Variables and Functions

```typescript
// Variables: camelCase
const userId = "123";
const isLoading = true;

// Functions: camelCase with verb prefix
const fetchUserData = async () => {};
const handleLogin = () => {};
const getUserProfile = () => {};

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const API_TIMEOUT = 30000;
```

## State Management

### Context API (Primary)

**AuthContext**:

```typescript
const { isLoading, isAuthenticated, login, logout } = useAuth();
```

**SocketContext**:

```typescript
const { socket, isConnected } = useSocket();
```

### Zustand (For Simple State)

```typescript
import create from "zustand";

interface VideoStore {
  videos: Video[];
  setVideos: (videos: Video[]) => void;
}

export const useVideoStore = create<VideoStore>((set) => ({
  videos: [],
  setVideos: (videos) => set({ videos }),
}));
```

### Redux Toolkit (For Complex State)

```typescript
export const videoSlice = createSlice({
  name: "video",
  initialState: { videos: [] },
  reducers: {
    setVideos: (state, action) => {
      state.videos = action.payload;
    },
  },
});
```

## Navigation

### Navigation Stack

```typescript
// Root Navigation
export default function RootNavigation() {
  const Stack = createStackNavigator();
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={HomeBottomTabNavigation} />
            <Stack.Screen name="Conversation" component={ConversationScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Tab Navigation

```typescript
const Tab = createBottomTabNavigator();

function HomeBottomTabNavigation() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

## API Integration

### HTTP Client Setup

```typescript
// HttpClient.ts
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8082/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor with token refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Token refresh logic
    if (error.response?.status === 401) {
      // Refresh token
    }
    return Promise.reject(error);
  }
);
```

### Service Pattern

```typescript
// AuthService.ts
export const loginRequest = async (payload: LoginPayload) => {
  try {
    const { data } = await api.post<ApiResponse<LoginResponse>>(
      "/auth/token",
      payload
    );
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
```

### Error Handling

```typescript
try {
  const response = await videoService.uploadVideo(videoData);
  // Success
} catch (error: any) {
  if (error.response) {
    // Server responded with error
    Alert.alert("Error", error.response.data.message);
  } else if (error.request) {
    // Network error
    Alert.alert("Network Error", "Unable to connect to server");
  } else {
    // Other error
    Alert.alert("Error", "Something went wrong");
  }
}
```

## Styling

### NativeWind (TailwindCSS)

**Configuration**:

```javascript
// tailwind.config.js
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**Usage**:

```typescript
import { View, Text } from "react-native";

export default function LoginScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      <Text className="text-2xl font-bold text-gray-800">Login</Text>
    </View>
  );
}
```

### StyleSheet Pattern

```typescript
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
});
```

## Performance Optimization

### List Optimization

```typescript
import { FlatList } from "react-native";

<FlatList
  data={videos}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <VideoItem video={item} />}
  windowSize={10}
  initialNumToRender={5}
  maxToRenderPerBatch={5}
  removeClippedSubviews={true}
/>;
```

### Memoization

```typescript
import { useMemo, useCallback } from "react";

const UserProfile = ({ user }) => {
  const displayName = useMemo(() => {
    return user.displayName || user.username;
  }, [user]);

  const handleFollow = useCallback(() => {
    // Follow logic
  }, []);
};
```

### Image Optimization

```typescript
import { Image } from "expo-image";

<Image
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>;
```

## Testing

### Component Testing

```typescript
import { render, fireEvent } from "@testing-library/react-native";

test("should display login screen", () => {
  const { getByText } = render(<LoginScreen />);
  expect(getByText("Login")).toBeTruthy();
});
```

## Related Documents

- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- [AUTHENTICATION_FLOW.md](./AUTHENTICATION_FLOW.md)

## Change Log

| Version | Date       | Changes         | Author      |
| ------- | ---------- | --------------- | ----------- |
| 1.0     | 2025-01-27 | Initial version | Mobile Team |
