# Backend Development Rules

> **Version**: 1.0
> **Last Updated**: 2025-01-27
> **Owner**: Backend Team

## Table of Contents

- [Project Structure](#project-structure)
- [Naming Conventions](#naming-conventions)
- [Layer Responsibilities](#layer-responsibilities)
- [Dependency Injection](#dependency-injection)
- [Exception Handling](#exception-handling)
- [Validation Rules](#validation-rules)
- [Transaction Management](#transaction-management)
- [Security Implementation](#security-implementation)
- [API Versioning](#api-versioning)
- [Logging and Monitoring](#logging-and-monitoring)
- [Testing Requirements](#testing-requirements)
- [Configuration Management](#configuration-management)

## Project Structure

### Package Organization

```
com.hehe.thesocial/
├── Application.java                    # Main application class
├── config/                            # Configuration classes
│   ├── SecuritySetting.java          # Spring Security configuration
│   ├── WebSocketConfig.java          # WebSocket/STOMP configuration
│   ├── KafkaConfig.java               # Kafka configuration
│   ├── OpenAIConfig.java             # AI service configuration
│   └── CustomJwtDecoder.java         # JWT decoder implementation
├── controller/                        # REST Controllers
├── service/                           # Business logic layer
│   ├── authentication/
│   ├── video/
│   ├── chatMessage/
│   └── ...
├── repository/                        # Data access layer
├── entity/                            # Domain models
├── dto/                               # Data Transfer Objects
│   ├── request/                       # Request DTOs
│   └── response/                      # Response DTOs
├── mapper/                            # MapStruct mappers
├── exception/                         # Exception handling
├── constant/                          # Constants and enums
└── listener/                          # Event listeners
```

### File Organization Rules

1. **One Class Per File**: Never put multiple public classes in one file
2. **Logical Grouping**: Group related classes in the same package
3. **Layered Separation**: Controllers, Services, Repositories must be in separate packages
4. **DTO Separation**: Separate request and response DTOs

## Naming Conventions

### Classes

| Type                   | Pattern                 | Example                                     |
| ---------------------- | ----------------------- | ------------------------------------------- |
| Entity                 | `PascalCase`            | `User`, `Video`, `ChatMessage`              |
| Controller             | `*Controller`           | `VideoController`, `UserController`         |
| Service Interface      | `*Service`              | `VideoService`, `UserService`               |
| Service Implementation | `*ServiceImpl`          | `VideoServiceImpl`, `UserServiceImpl`       |
| Repository             | `*Repository`           | `UserRepository`, `VideoRepository`         |
| DTO                    | `*Request`, `*Response` | `VideoUploadRequest`, `VideoUploadResponse` |
| Mapper                 | `*Mapper`               | `VideoMapper`, `UserMapper`                 |
| Configuration          | `*Config`, `*Setting`   | `WebSocketConfig`, `SecuritySetting`        |
| Exception              | `*Exception`, `*Error`  | `AppException`, `ErrorCode`                 |

### Methods

| Type                 | Pattern                             | Example                            |
| -------------------- | ----------------------------------- | ---------------------------------- |
| Service Methods      | `verbNoun()`                        | `uploadVideo()`, `getVideoById()`  |
| Repository Methods   | `findBy*`, `deleteBy*`, `existsBy*` | `findByUsername()`, `deleteById()` |
| Controller Endpoints | Match HTTP verb                     | `@GetMapping`, `@PostMapping`      |

### Variables

| Type            | Pattern                     | Example                              |
| --------------- | --------------------------- | ------------------------------------ |
| Local Variables | `camelCase`                 | `videoId`, `userName`                |
| Final Fields    | `lowercase` or `UPPER_CASE` | `final String userId`                |
| Constants       | `UPPER_SNAKE_CASE`          | `MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE` |

### Fields in Entities

**MongoDB Field Naming**:

- Use **snake_case** for MongoDB field names
- Use `@Field` annotation to specify field name
- Example: `createdAt` → `created_at` in database

```java
@Field("user_name")
String userName;

@Field("created_at")
Instant createdAt;
```

## Layer Responsibilities

### 1. Controller Layer (`controller` package)

**Responsibilities**:

- Handle HTTP requests and responses
- Request validation (using `@Valid`)
- HTTP status code mapping
- Response wrapping in `ApiResponse<T>`

**DO**:

```java
@RestController
@RequestMapping("/videos")
@RequiredArgsConstructor
public class VideoController {
    private final VideoService videoService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VideoResponse>> getVideo(@PathVariable String id) {
        VideoResponse video = videoService.getVideoById(id);
        return ResponseEntity.ok(ApiResponse.<VideoResponse>builder()
                .result(video)
                .build());
    }
}
```

**DON'T**:

```java
// ❌ Don't put business logic in controllers
@PostMapping
public ResponseEntity<VideoResponse> uploadVideo(@RequestParam MultipartFile file) {
    // Don't put business logic here
    String filename = file.getOriginalFilename();
    // ... complex logic
}
```

### 2. Service Layer (`service` package)

**Responsibilities**:

- Business logic implementation
- Transaction management
- Data validation
- Orchestrating multiple repositories
- Calling external services

**Interface Pattern**:

```java
public interface VideoService {
    VideoResponse getVideoById(String id);
    Page<VideoResponse> getAllVideos(Pageable pageable);
    VideoUploadResponse uploadVideo(VideoUploadRequest request);
}
```

**Implementation Pattern**:

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class VideoServiceImpl implements VideoService {
    private final VideoRepository videoRepository;
    private final FileRepository fileRepository;
    private final VideoMapper videoMapper;

    @Override
    @Transactional
    public VideoUploadResponse uploadVideo(VideoUploadRequest request) {
        // Business logic here
        Video video = new Video();
        // ... processing
        videoRepository.save(video);
        return videoMapper.toResponse(video);
    }
}
```

### 3. Repository Layer (`repository` package)

**Responsibilities**:

- Database operations
- Custom queries
- Query optimization

**Interface Pattern**:

```java
public interface VideoRepository extends MongoRepository<Video, String> {
    Page<Video> findByUploader(UserDetail uploader, Pageable pageable);
    List<Video> findByTitleContaining(String title);
    boolean existsByUploader(UserDetail uploader);
}
```

**Custom Queries**:

```java
@Query("{ 'uploader_ref': ?0, 'created_at': { $gte: ?1 } }")
List<Video> findRecentVideosByUploader(UserDetail uploader, Instant since);
```

### 4. Entity Layer (`entity` package)

**Responsibilities**:

- Domain modeling
- Data structure definition
- Relationship mapping

**Pattern**:

```java
@Document(collection = "videos")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Video extends BaseDocument {
    @MongoId
    @Field("_id")
    String id;

    @DBRef
    @Field("uploader_ref")
    UserDetail uploader;

    @Field("title")
    String title;

    // ... other fields
}
```

## Dependency Injection

### Constructor Injection (Preferred)

```java
@Service
@RequiredArgsConstructor
public class VideoServiceImpl implements VideoService {
    private final VideoRepository videoRepository;
    private final FileService fileService;
    private final VideoMapper videoMapper;
}
```

**Why**:

- Immutable dependencies
- Easier testing
- No circular dependency issues

### Field Injection (NOT Recommended)

```java
// ❌ Avoid field injection
@Autowired
private VideoRepository videoRepository;
```

**Why Not**:

- Violates immutability
- Harder to test
- Hidden dependencies

### Lombok Annotations

```java
@RequiredArgsConstructor  // Auto-generates constructor for final fields
@AllArgsConstructor        // All-args constructor
@NoArgsConstructor          // No-args constructor
@Builder                // Builder pattern
```

## Exception Handling

### Custom Exception (`AppException`)

```java
public class AppException extends RuntimeException {
    private final ErrorCode errorCode;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
```

### Error Code Enum

```java
@Getter
public enum ErrorCode {
    VIDEO_NOT_FOUND(HttpStatus.NOT_FOUND, 1102, "Video not found!"),
    UNAUTHENTICATED(HttpStatus.BAD_REQUEST, 1001, "Invalid authentication info"),
    INVALID_FILE(HttpStatus.BAD_REQUEST, 1051, "File uploaded not valid!");

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
}
```

### Usage in Service

```java
public Video getVideoById(String id) {
    return videoRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.VIDEO_NOT_FOUND));
}
```

## Validation Rules

### Request Validation

**Using Jakarta Bean Validation**:

```java
public class VideoUploadRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "File is required")
    @ValidFile(maxSize = 50 * 1024 * 1024, types = {"video/mp4"})
    private MultipartFile file;
}
```

**Controller Validation**:

```java
@PostMapping("/upload")
public ResponseEntity<ApiResponse<VideoResponse>> uploadVideo(
        @Valid @RequestBody VideoUploadRequest request) {
    // Request is automatically validated
}
```

### Entity Validation

```java
@Document(collection = "users")
public class User extends BaseDocument {
    @Email
    @Indexed(unique = true, sparse = true)
    @Field("mail")
    private String mail;

    @NotNull
    @Field("username")
    private String username;
}
```

## Transaction Management

### Declarative Transactions

```java
@Service
@Transactional
public class VideoServiceImpl implements VideoService {

    @Transactional
    public VideoUploadResponse uploadVideo(VideoUploadRequest request) {
        // Multiple database operations
        FileDocument file = fileRepository.save(...);
        Video video = videoRepository.save(...);
        // All succeed or all rollback
        return response;
    }
}
```

### Transaction Propagation

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void logActivity(Activity activity) {
    // Always creates new transaction
}

@Transactional(readOnly = true)
public Video getVideo(String id) {
    // Read-only transaction
    return videoRepository.findById(id).orElseThrow();
}
```

## Security Implementation

### JWT Authentication

**Configuration**:

```java
@Configuration
@EnableMethodSecurity
public class SecuritySetting {

    @Bean
    SecurityFilterChain httpSecurity(HttpSecurity http) throws Exception {
        return http
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers("/auth/**").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.decoder(customJwtDecoder))
                )
                .build();
    }
}
```

### Custom JWT Decoder

```java
@Component
public class CustomJwtDecoder implements JwtDecoder {
    // Custom token validation logic
}
```

### Method-Level Security

```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteVideo(String id) {
    // Only ADMIN role can execute
}

@PreAuthorize("#userId == authentication.principal.id")
public UserDetail getUserDetail(String userId) {
    // Users can only access their own data
}
```

### Password Encoding

```java
@Bean
PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12); // Strength 12
}
```

## API Versioning

### URL Versioning (Current)

```
Base URL: http://localhost:8082/api/v1

Endpoints:
- /api/v1/videos
- /api/v1/auth/token
- /api/v1/chat-messages
```

**Configuration**:

```yaml
server:
  servlet:
    context-path: /api/v1
```

### Versioning Strategy

- Current version: `v1`
- Future versions: `v2`, `v3`
- Backward compatibility required for at least one previous version

## Logging and Monitoring

### Logging Rules

**Use SLF4J with Lombok**:

```java
@Slf4j
public class VideoServiceImpl {

    public void uploadVideo(VideoUploadRequest request) {
        log.info("Uploading video: {}", request.getTitle());
        try {
            // ... logic
            log.debug("Video uploaded successfully: {}", videoId);
        } catch (Exception e) {
            log.error("Failed to upload video", e);
            throw e;
        }
    }
}
```

**Log Levels**:

- `ERROR`: Critical errors requiring immediate attention
- `WARN`: Warning situations (e.g., deprecated features)
- `INFO`: General informational messages
- `DEBUG`: Detailed information for debugging

### Structured Logging

```java
log.info("Getting videos for user: {} with page: {}, size: {}",
    userId, pageable.getPageNumber(), pageable.getPageSize());
```

## Testing Requirements

### Unit Tests

**Service Layer Testing**:

```java
@ExtendWith(MockitoExtension.class)
class VideoServiceImplTest {

    @Mock
    private VideoRepository videoRepository;

    @InjectMocks
    private VideoServiceImpl videoService;

    @Test
    void shouldReturnVideo_WhenExists() {
        // Given
        String videoId = "123";
        Video video = Video.builder().id(videoId).build();
        when(videoRepository.findById(videoId)).thenReturn(Optional.of(video));

        // When
        Video result = videoService.getVideoById(videoId);

        // Then
        assertNotNull(result);
        assertEquals(videoId, result.getId());
    }
}
```

### Integration Tests

```java
@SpringBootTest
@AutoConfigureMockMvc
class VideoControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldUploadVideo_WhenValidRequest() throws Exception {
        mockMvc.perform(multipart("/videos/upload")
                .file("file", "content".getBytes()))
                .andExpect(status().isOk());
    }
}
```

### Testing Standards

1. **Service Layer**: Must have 80%+ code coverage
2. **Controller Layer**: Test all endpoints
3. **Exception Handling**: Test all error cases
4. **Integration Tests**: Test critical flows

## Configuration Management

### application.yml Structure

```yaml
spring:
  application:
    name: TheSocial
  data:
    mongodb:
      uri: ${MONGODB_URL}
  kafka:
    bootstrap-servers: ${KAFKA_BOOSTRAP_SERVER}
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer

server:
  port: 8082
  servlet:
    context-path: /api/v1

jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_DURATION}
  refreshable: ${JWT_REFRESH_DURATION}
```

### Environment Variables

**Required Variables**:

- `MONGODB_URL`: MongoDB connection string
- `KAFKA_BOOSTRAP_SERVER`: Kafka broker URL
- `JWT_SECRET`: JWT signing secret
- `JWT_DURATION`: Access token duration
- `OPENAI_API_KEY`: OpenAI API key
- `SERVER_HOST`: Server hostname
- `CORS_URL`: Allowed CORS origins
- `FILE_UPLOAD_DIR`: File upload directory

### Configuration Classes

```java
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String secret;
    private String expiration;
    private String refreshable;
}
```

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database design
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference

## Change Log

| Version | Date       | Changes         | Author       |
| ------- | ---------- | --------------- | ------------ |
| 1.0     | 2025-01-27 | Initial version | Backend Team |
