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

## Code Quality Patterns and Best Practices

### Service Layer Best Practices

**Always use service layer for API calls:**

```typescript
// ✅ Good - Use service
const response = await ConversationService.createConversation(request);

// ❌ Bad - Direct API call in component
const response = await api.post("/conversations", request);
```

**Service methods should return `ApiResponse<T>`:**

```typescript
// ✅ Good
const ConversationService = {
  getMyConversations: async (): Promise<
    ApiResponse<Page<ConversationResponse>>
  > => {
    const response = await api.get("/conversations/me");
    return response.data;
  },
};
```

**Services should not handle UI concerns:**

```typescript
// ❌ Bad - Service with UI logic
const ConversationService = {
  createConversation: async (request) => {
    const response = await api.post("/conversations", request);
    Alert.alert("Success", "Conversation created"); // Don't do this
    return response.data;
  },
};

// ✅ Good - Service only handles API
const ConversationService = {
  createConversation: async (request) => {
    const response = await api.post("/conversations", request);
    return response.data;
  },
};
```

### Context Provider Patterns

**Always memoize context values:**

```typescript
// ✅ Good - Memoized value
const value = useMemo(
  () => ({
    isLoading,
    conversations,
    getMyConversations,
    refreshConversations,
  }),
  [isLoading, conversations, getMyConversations, refreshConversations]
);

// ❌ Bad - New object on every render
const value = {
  isLoading,
  conversations,
  getMyConversations,
  refreshConversations,
};
```

**Provide default values:**

```typescript
// ✅ Good - Default values provided
const ConversationContext = createContext<ConversationsContextType>({
  isLoading: false,
  conversations: [],
  getMyConversations: () => {},
  clearConversations: () => {},
});
```

**Clear state on logout:**

```typescript
// ✅ Good - Cleanup on logout
useEffect(() => {
  if (!isAuthenticated) {
    clearConversations();
    setUserDetailId(null);
  }
}, [isAuthenticated]);
```

### Component State Management

**Prevent duplicate API calls:**

```typescript
// ✅ Good - Loading flag prevents duplicates
const handleUserSelect = async (user: UserSearchResult) => {
  if (isCreatingConversation || isAddingMember) return;

  setIsCreatingConversation(true);
  try {
    // API call
  } finally {
    setIsCreatingConversation(false);
  }
};
```

**Use proper dependency arrays:**

```typescript
// ✅ Good - Correct dependencies
useEffect(() => {
  if (searchQuery.trim()) {
    searchUsers(searchQuery);
  }
}, [searchQuery]);

// ❌ Bad - Missing dependency
useEffect(() => {
  searchUsers(searchQuery);
}, []); // Missing searchQuery dependency
```

**Clean up effects:**

```typescript
// ✅ Good - Cleanup subscription
useEffect(() => {
  const subscription = socket.on("message", handleMessage);
  return () => {
    subscription.off("message", handleMessage);
  };
}, []);
```

### Error Handling Patterns

**Always handle errors with user-friendly messages:**

```typescript
// ✅ Good - Comprehensive error handling
try {
  const response = await ConversationService.createConversation(request);
  // Success handling
} catch (error) {
  console.error("Error creating conversation:", error);
  setError(
    "Failed to create conversation. Please check your connection and try again."
  );
} finally {
  setIsCreatingConversation(false);
}
```

**Show error states in UI:**

```typescript
// ✅ Good - Error state component
{
  error ? (
    <View className="flex-1 justify-center items-center py-20">
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text className="text-red-500 text-lg mt-4">Error</Text>
      <Text className="text-gray-400 text-sm mt-2 text-center px-8">
        {error}
      </Text>
      <TouchableOpacity onPress={handleRetry}>
        <Text className="text-white font-semibold">Try Again</Text>
      </TouchableOpacity>
    </View>
  ) : null;
}
```

### Navigation Best Practices

**Use typed navigation:**

```typescript
// ✅ Good - Typed navigation
type UserSearchNavigationProp = StackNavigationProp<
  InboxStackParamList,
  "UserSearch"
>;

const navigation = useNavigation<UserSearchNavigationProp>();
navigation.navigate("Conversation", { conversationId: "123" });
```

**Access parent navigator when needed:**

```typescript
// ✅ Good - Parent navigation
const parentNavigation =
  navigation.getParent<StackNavigationProp<AuthedStackParamList>>();
if (parentNavigation) {
  parentNavigation.navigate("UserProfile", { userDetailId: user.id });
}
```

**Handle route params safely:**

```typescript
// ✅ Good - Safe param access
const params =
  (route.params as { mode?: string; conversationId?: string }) || {};
const isAddMemberMode = params.mode === "addMember";
const conversationId = params.conversationId;
```

### Image and URL Handling

**Always use utility functions:**

```typescript
// ✅ Good - Use utility
import { getAvatarUrl } from "../../Utils/ImageUrlHelper";

const avatarUrl =
  userDetail.avatar?.fileName && userDetail.id
    ? getAvatarUrl(userDetail.id, userDetail.avatar.fileName)
    : null;

// ❌ Bad - Hardcoded URL construction
const avatarUrl = `http://192.168.239.147:8082/api/v1/files/${id}/${fileName}`;
```

**Handle null/undefined URLs:**

```typescript
// ✅ Good - Null check
{
  avatarUrl ? (
    <Image source={{ uri: avatarUrl }} />
  ) : (
    <Image source={UNKNOWN_AVATAR} />
  );
}
```

### Data Filtering and Mapping

**Filter current user from lists:**

```typescript
// ✅ Good - Filter current user
const mappedResults = (apiResponse.result || [])
  .map(mapUserDetailToSearchResult)
  .filter((user) => currentUserDetail && user.id !== currentUserDetail.id);
```

**Use helper functions for mapping:**

```typescript
// ✅ Good - Mapping helper
const mapUserDetailToSearchResult = (
  userDetail: UserDetailResponse
): UserSearchResult => {
  const avatarUrl =
    userDetail.avatar?.fileName && userDetail.id
      ? getAvatarUrl(userDetail.id, userDetail.avatar.fileName)
      : null;

  return {
    id: userDetail.id,
    displayName:
      userDetail.displayName || userDetail.shownName || "Unknown User",
    username: userDetail.shownName || userDetail.displayName,
    avatar: avatarUrl ? { url: avatarUrl } : undefined,
  };
};
```

### Loading States

**Show loading indicators:**

```typescript
// ✅ Good - Loading state
{isLoading ? (
  <View className="flex-1 justify-center items-center">
    <ActivityIndicator size="large" color="#EC4899" />
    <Text className="text-gray-500 mt-2">Searching users...</Text>
  </View>
) : (
  // Content
)}
```

**Overlay loading for blocking operations:**

```typescript
// ✅ Good - Overlay loading
{
  (isCreatingConversation || isAddingMember) && (
    <View className="absolute inset-0 bg-black bg-opacity-50 flex-1 justify-center items-center z-50">
      <View className="bg-white p-6 rounded-lg items-center">
        <ActivityIndicator size="large" color="#EC4899" />
        <Text className="text-gray-600 mt-3">
          {isAddingMember ? "Adding member..." : "Creating conversation..."}
        </Text>
      </View>
    </View>
  );
}
```

### Empty States

**Always provide empty states:**

```typescript
// ✅ Good - Empty state
const renderEmptyState = () => (
  <View className="flex-1 justify-center items-center py-20">
    <Ionicons name="search-outline" size={64} color="#9CA3AF" />
    <Text className="text-gray-500 text-lg mt-4">
      {searchQuery ? "No users found" : "Search for users to chat with"}
    </Text>
    <Text className="text-gray-400 text-sm mt-2">
      {searchQuery
        ? "Try searching with a different name"
        : "Enter a display name or username to get started"}
    </Text>
  </View>
);

<FlatList
  data={users}
  renderItem={renderUserItem}
  ListEmptyComponent={renderEmptyState}
/>;
```

### Type Safety

**Use proper TypeScript types:**

```typescript
// ✅ Good - Proper types
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import { ConversationRequest } from "../../Types/request/ConversationRequest";

const [currentUserDetail, setCurrentUserDetail] =
  useState<UserDetailResponse | null>(null);

// ❌ Bad - Using any
const [currentUserDetail, setCurrentUserDetail] = useState<any>(null);
```

**Create helper types when needed:**

```typescript
// ✅ Good - Helper type
type UserSearchResult = UserItemData;

// ✅ Good - Type from component
import UserItem, { UserItemData } from "../../Components/UserItem";
```

### Common Pitfalls to Avoid

1. **Don't call APIs directly in components** - Always use service layer
2. **Don't forget loading states** - Users need feedback
3. **Don't forget error handling** - Always catch and display errors
4. **Don't use hardcoded URLs** - Use utility functions
5. **Don't forget to clean up effects** - Prevent memory leaks
6. **Don't mutate state directly** - Always use setState
7. **Don't forget to filter current user** - When showing user lists
8. **Don't use `any` type** - Use proper TypeScript types
9. **Don't forget navigation type safety** - Use typed navigation
10. **Don't forget empty states** - Provide helpful empty states

## Change Log

| Version | Date       | Changes                                        | Author      |
| ------- | ---------- | ---------------------------------------------- | ----------- |
| 1.0     | 2025-01-27 | Initial version                                | Mobile Team |
| 1.1     | 2025-01-27 | Added code quality patterns and best practices | Mobile Team |
