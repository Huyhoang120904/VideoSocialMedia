# Error Handling Strategy

> **Version**: 1.0
> **Last Updated**: 2025-01-27
> **Owner**: Development Team

## Table of Contents

- [Error Classification](#error-classification)
- [Error Response Format](#error-response-format)
- [Backend Error Handling](#backend-error-handling)
- [Frontend Error Display](#frontend-error-display)
- [Error Logging](#error-logging)
- [Recovery Mechanisms](#recovery-mechanisms)

## Error Classification

### Error Categories

| Category           | HTTP Status | Description                 | Example                   |
| ------------------ | ----------- | --------------------------- | ------------------------- |
| **Client Errors**  | 400-499     | User input error            | Invalid email format      |
| **Server Errors**  | 500-599     | Server-side failure         | Database connection error |
| **Network Errors** | N/A         | Network connectivity issues | Timeout, no internet      |
| **Authentication** | 401         | Unauthorized access         | Expired token             |
| **Authorization**  | 403         | Permission denied           | Insufficient role         |

## Error Response Format

### Standard Error Response

All API errors follow this structure:

```json
{
  "code": 1102,
  "message": "Video not found!",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": null
}
```

**Fields**:

- `code`: Error code (custom or HTTP status)
- `message`: Human-readable error message
- `timestamp`: Error occurrence time
- `result`: Always null for errors

## Backend Error Handling

### Custom Exception: AppException

```java
public class AppException extends RuntimeException {
    private final ErrorCode errorCode;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
```

### Error Code Enum

```java
@Getter
public enum ErrorCode {
    // 4xx Errors
    VIDEO_NOT_FOUND(HttpStatus.NOT_FOUND, 1102, "Video not found!"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, 1101, "User not found!"),
    UNAUTHENTICATED(HttpStatus.UNAUTHORIZED, 1001, "Invalid authentication info"),

    // 5xx Errors
    UNCATEGORIZED(HttpStatus.INTERNAL_SERVER_ERROR, 9999, "Unknown Error"),
    ERROR_UPLOADING_FILE(HttpStatus.INTERNAL_SERVER_ERROR, 1052, "File uploaded having trouble");

    private final HttpStatus httpStatus;
    private final int code;
    private final String message;
}
```

### Global Exception Handler

```java
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse<?>> appExceptionHandler(AppException ex) {
        log.error("App Error: {}", ex.getMessage());

        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .code(ex.getErrorCode().getCode())
                .message(ex.getErrorCode().getMessage())
                .build();

        return ResponseEntity.status(ex.getErrorCode().getHttpStatus())
                .body(apiResponse);
    }

    @ExceptionHandler(value = RuntimeException.class)
    ResponseEntity<ApiResponse<?>> runtimeExceptionHandler(RuntimeException ex) {
        log.error("Runtime Error: ", ex);

        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .code(ErrorCode.UNCATEGORIZED.getCode())
                .message(ErrorCode.UNCATEGORIZED.getMessage())
                .build();

        return ResponseEntity.internalServerError().body(apiResponse);
    }
}
```

### Service Error Handling

```java
@Service
@RequiredArgsConstructor
public class VideoServiceImpl {

    public Video getVideoById(String id) {
        return videoRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VIDEO_NOT_FOUND));
    }

    public void uploadVideo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_FILE);
        }

        try {
            // Upload logic
        } catch (IOException e) {
            log.error("Error uploading file: {}", e.getMessage());
            throw new AppException(ErrorCode.ERROR_UPLOADING_FILE);
        }
    }
}
```

## Frontend Error Display

### Mobile App Error Handling

**Toast Notification** (React Native):

```typescript
import { Alert } from "react-native";

try {
  await uploadVideo(videoData);
} catch (error: any) {
  if (error.response) {
    // Server error
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

**Error Boundary** (React):

```typescript
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <View>
      <Text>Something went wrong</Text>
      <Text>{error.message}</Text>
      <Button onPress={resetErrorBoundary}>Try Again</Button>
    </View>
  );
}

export function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Navigation />
    </ErrorBoundary>
  );
}
```

### Web App Error Handling

**React Query Error Handling**:

```typescript
const { data, error, isLoading } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  onError: (error) => {
    toast.error(error.response?.data?.message || "Failed to load users");
  },
});
```

**Form Validation**:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
});

function RegisterForm() {
  const {
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form>
      <Input name="username" />
      {errors.username && <span>{errors.username.message}</span>}
    </form>
  );
}
```

## Error Logging

### Backend Logging

**Logger Configuration**:

```yaml
logging:
  level:
    root: INFO
    com.hehe.thesocial: DEBUG
    org.springframework.security: WARN
    org.apache.kafka: ERROR
```

**Service Logging**:

```java
@Slf4j
public class VideoServiceImpl {

    public void uploadVideo(VideoUploadRequest request) {
        log.info("Uploading video: {}", request.getTitle());

        try {
            // Upload logic
            log.debug("Video uploaded successfully: {}", videoId);
        } catch (Exception e) {
            log.error("Failed to upload video: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.ERROR_UPLOADING_FILE);
        }
    }
}
```

### Frontend Logging

**Console Logging** (Development):

```typescript
// Only in development
if (__DEV__) {
  console.log("API Request:", requestConfig);
  console.log("API Response:", response);
}
```

**Error Tracking** (Production):

```typescript
// Send to error tracking service
if (!__DEV__ && error) {
  Sentry.captureException(error);
}
```

## Recovery Mechanisms

### Retry Strategy

**HTTP Client Retry** (Mobile):

```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const retry = async (fn, retries = MAX_RETRIES) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await delay(RETRY_DELAY);
      return retry(fn, retries - 1);
    }
    throw error;
  }
};
```

### Offline Handling

**Network Status Detection**:

```typescript
import NetInfo from "@react-native-community/netinfo";

NetInfo.addEventListener((state) => {
  if (!state.isConnected) {
    Alert.alert("No Internet", "Please check your connection");
  }
});
```

**Offline Queue**:

```typescript
// Queue requests when offline
const requestQueue = [];

if (!isConnected) {
  requestQueue.push(request);
} else {
  // Process queued requests
  processQueue();
}
```

### User-Friendly Messages

**Error Message Mapping**:

```typescript
const errorMessages = {
  1101: "User not found. Please check your account.",
  1102: "Video not found. It may have been deleted.",
  1001: "Your session has expired. Please login again.",
  1051: "Invalid file. Please upload a valid video file.",
};

const getErrorMessage = (code: number) => {
  return errorMessages[code] || "An error occurred. Please try again.";
};
```

## Related Documents

- [BACKEND_RULES.md](./BACKEND_RULES.md) - Backend exception handling
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Error codes reference

## Change Log

| Version | Date       | Changes         | Author           |
| ------- | ---------- | --------------- | ---------------- |
| 1.0     | 2025-01-27 | Initial version | Development Team |
