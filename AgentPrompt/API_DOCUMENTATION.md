# API Documentation

> **Version**: 1.0
> **Last Updated**: 2025-01-27
> **Owner**: Backend Team

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Common Response Format](#common-response-format)
- [Error Responses](#error-responses)
- [Endpoints](#endpoints)
- [WebSocket Endpoints](#websocket-endpoints)
- [Rate Limiting](#rate-limiting)
- [Pagination](#pagination)

## Overview

The Social API follows RESTful principles and provides endpoints for user authentication, content management, messaging, and social interactions.

## Base URL

**Production**: `https://api.thesocial.com/api/v1`

**Development**: `http://localhost:8082/api/v1`

**Context Path**: `/api/v1`

## Authentication

### JWT Token-Based Authentication

Most endpoints require a valid JWT token in the `Authorization` header.

**Format**:

```
Authorization: Bearer <JWT_TOKEN>
```

**Token Structure**:

```json
{
  "sub": "user_id",
  "iat": 1704067200,
  "exp": 1704070800,
  "authorities": ["ROLE_USER"]
}
```

### Token Types

1. **Access Token**: Short-lived (configurable via `JWT_DURATION`)
2. **Refresh Token**: Long-lived (configurable via `JWT_REFRESH_DURATION`)

## Common Response Format

All API responses follow this structure:

```json
{
  "code": 1000,
  "message": "Successful",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": {
    // Response data
  }
}
```

**Fields**:

- `code`: HTTP status code or custom error code
- `message`: Human-readable message
- `timestamp`: Response timestamp
- `result`: Response payload (type varies by endpoint)

## Error Responses

### Error Response Format

```json
{
  "code": 1101,
  "message": "User not found!",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": null
}
```

### Common Error Codes

| Code | HTTP Status | Description                 |
| ---- | ----------- | --------------------------- |
| 9999 | 500         | Unknown Error               |
| 1001 | 400         | Invalid authentication info |
| 1002 | 403         | User account is disabled    |
| 1051 | 400         | File uploaded not valid     |
| 1052 | 500         | Error uploading file        |
| 1053 | 404         | File not found              |
| 1101 | 404         | User not found              |
| 1102 | 404         | Video not found             |
| 1103 | 404         | Image slide not found       |
| 1104 | 404         | Role not found              |
| 1105 | 404         | Conversation not found      |
| 1106 | 404         | Message not found           |

## Endpoints

### Authentication Endpoints

#### POST /auth/token

Authenticate user and receive JWT tokens.

**Request**:

```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response** (`200 OK`):

```json
{
  "code": 1000,
  "message": "Successful",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "tokenType": "Bearer"
  }
}
```

#### POST /auth/refresh

Refresh access token using refresh token.

**Request**:

```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response** (`200 OK`):

```json
{
  "code": 1000,
  "message": "Successful",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": {
    "token": "new_access_token",
    "tokenType": "Bearer"
  }
}
```

#### POST /auth/logout

Logout user and invalidate tokens.

**Request**:

```json
{
  "token": "jwt_token_here"
}
```

**Response** (`200 OK`):

```json
{
  "code": 1000,
  "message": "Logout successful",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": null
}
```

---

### Video Endpoints

#### GET /videos

Get all videos with pagination.

**Query Parameters**:

- `page` (int, default: 0): Page number
- `size` (int, default: 10): Page size
- `sort` (string, optional): Sort by field

**Headers**: Optional (public endpoint)

**Response** (`200 OK`):

```json
{
  "code": 1000,
  "message": "Videos retrieved successfully",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": {
    "videos": [
      {
        "id": "video_id",
        "fileId": "file_id",
        "uploader": {
          "id": "user_detail_id",
          "displayName": "John Doe"
        },
        "url": "https://...",
        "title": "My Video",
        "description": "Video description",
        "duration": 30.5,
        "createdAt": "2025-01-27T12:00:00Z"
      }
    ],
    "totalElements": 100,
    "totalPages": 10,
    "currentPage": 0,
    "pageSize": 10
  }
}
```

#### GET /videos/user/{userId}

Get videos by user ID.

**Path Parameters**:

- `userId` (string): User ID

**Query Parameters**: Same as GET /videos

**Response** (`200 OK`): Same structure as GET /videos

#### POST /videos/upload

Upload a video.

**Request Body** (multipart/form-data):

- `file` (MultipartFile, required): Video file
- `title` (string, optional): Video title
- `description` (string, optional): Video description
- `thumbnail` (MultipartFile, optional): Custom thumbnail
- `duration` (double, optional): Video duration
- `hashTags` (string, optional): Comma-separated hashtags

**Headers**: Required (Authentication required)

**Response** (`200 OK`):

```json
{
  "code": 1000,
  "message": "Video uploaded successfully",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": {
    "id": "video_id",
    "url": "https://...",
    "title": "My Video",
    "message": "Video uploaded successfully"
  }
}
```

#### PUT /videos/{videoId}

Update video metadata.

**Path Parameters**:

- `videoId` (string): Video ID

**Request Body** (multipart/form-data):

- `title` (string, optional)
- `description` (string, optional)
- `thumbnail` (MultipartFile, optional)

**Response** (`200 OK`): File response with updated data

---

### Chat Message Endpoints

#### GET /chat-messages/conversation/{conversationId}

Get messages by conversation ID.

**Path Parameters**:

- `conversationId` (string): Conversation ID

**Query Parameters**:

- `page` (int, default: 0): Page number
- `size` (int, default: 20): Page size
- `sort` (string, default: "createdAt,DESC"): Sort order

**Response** (`200 OK`):

```json
{
  "code": 1000,
  "message": "Successful",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": {
    "content": [
      {
        "id": "message_id",
        "conversationId": "conversation_id",
        "senderId": "user_id",
        "message": "Hello!",
        "createdAt": "2025-01-27T12:00:00Z",
        "edited": false,
        "readParticipantsId": []
      }
    ],
    "totalElements": 50,
    "totalPages": 3,
    "currentPage": 0,
    "pageSize": 20
  }
}
```

#### POST /chat-messages

Create direct chat message.

**Request Body**:

```json
{
  "recipientId": "recipient_user_id",
  "message": "Hello!",
  "role": "user",
  "content": "Hello!"
}
```

**Response** (`201 Created`): ChatMessageResponse

#### POST /chat-messages/group

Create group chat message.

**Request Body**:

```json
{
  "conversationId": "conversation_id",
  "message": "Hello group!",
  "role": "user",
  "content": "Hello group!"
}
```

**Response** (`201 Created`): ChatMessageResponse

---

#### PUT /chat-messages/{messageId}

Update chat message.

**Path Parameters**:

- `messageId` (string): Message ID

**Request Body**:

```json
{
  "message": "Updated message"
}
```

**Response** (`200 OK`): Updated ChatMessageResponse

#### DELETE /chat-messages/{messageId}

Delete chat message.

**Path Parameters**:

- `messageId` (string): Message ID

**Response** (`200 OK`):

```json
{
  "code": 1000,
  "message": "Message deleted successfully",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": null
}
```

#### POST /chat-messages/{messageId}/read

Mark message as read.

**Path Parameters**:

- `messageId` (string): Message ID

**Response** (`200 OK`): Updated ChatMessageResponse

#### POST /chat-messages/conversation/{conversationId}/read-all

Mark all conversation messages as read.

**Path Parameters**:

- `conversationId` (string): Conversation ID

**Response** (`200 OK`):

```json
{
  "code": 1000,
  "message": "All messages marked as read",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": null
}
```

---

### Conversation Endpoints

#### GET /conversations/me

Get current user's conversations.

**Query Parameters**:

- `page` (int, default: 0)
- `size` (int, default: 20)

**Response** (`200 OK`): PagedModel of ConversationResponse

#### GET /conversations/{conversationId}

Get conversation by ID.

**Path Parameters**:

- `conversationId` (string): Conversation ID

**Response** (`200 OK`): ConversationResponse

#### POST /conversations

Create new conversation.

**Request Body**:

```json
{
  "participantIds": ["user_id_1", "user_id_2"],
  "conversationType": "DIRECT",
  "conversationName": "Chat with John"
}
```

**Response** (`201 Created`): ConversationResponse

#### PUT /conversations/{conversationId}

Update conversation.

**Path Parameters**:

- `conversationId` (string): Conversation ID

**Request Body**:

```json
{
  "conversationName": "Updated Name"
}
```

**Response** (`200 OK`): Updated ConversationResponse

#### POST /conversations/{conversationId}/members/{participantId}

Add member to conversation.

**Path Parameters**:

- `conversationId` (string): Conversation ID
- `participantId` (string): User detail ID

**Response** (`200 OK`): Updated ConversationResponse

#### DELETE /conversations/{conversationId}/members/{participantId}

Remove member from conversation.

**Path Parameters**:

- `conversationId` (string): Conversation ID
- `participantId` (string): User detail ID

**Response** (`200 OK`): Updated ConversationResponse

#### DELETE /conversations/{conversationId}

Delete conversation.

**Path Parameters**:

- `conversationId` (string): Conversation ID

**Response** (`204 No Content`)

---

### AI Chat Endpoints

#### POST /ai-chat/messages

Send a message to AI and receive a response.

**Request Body**:

```json
{
  "message": "What is the weather today?"
}
```

**Headers**: Requires authentication

**Response** (`201 Created`):

```json
{
  "code": 1000,
  "message": "AI message sent successfully",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": {
    "id": "message_id",
    "conversationId": "conversation_id",
    "senderId": "ai_assistant_id",
    "message": "The weather today is sunny with a temperature of 72°F.",
    "createdAt": "2025-01-27T12:00:00Z",
    "edited": false,
    "readParticipantsId": []
  }
}
```

#### GET /ai-chat/conversation

Get or create the AI conversation for the current authenticated user.

**Headers**: Requires authentication

**Response** (`200 OK`):

```json
{
  "code": 1000,
  "message": "AI conversation retrieved successfully",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": {
    "conversationId": "conversation_id",
    "conversationType": "DIRECT",
    "conversationName": "AI Assistant",
    "participants": [
      {
        "id": "user_detail_id",
        "displayName": "John Doe"
      },
      {
        "id": "ai_assistant_id",
        "displayName": "AI Assistant"
      }
    ],
    "createdAt": "2025-01-27T12:00:00Z"
  }
}
```

---

### User Detail Endpoints

#### GET /user-details/me

Get current user's detail.

**Response** (`200 OK`): UserDetailResponse

#### GET /user-details/{userDetailId}

Get user detail by ID.

**Path Parameters**:

- `userDetailId` (string): User detail ID

**Response** (`200 OK`): UserDetailResponse

#### GET /user-details/by-user/{userId}

Get user detail by User ID.

**Path Parameters**:

- `userId` (string): User ID

**Response** (`200 OK`): UserDetailResponse

#### GET /user-details

Get all user details.

**Response** (`200 OK`): List<UserDetailResponse>

#### GET /user-details/paginated

Get paginated user details.

**Query Parameters**:

- `page` (int, default: 0)
- `size` (int, default: 10)
- `sortBy` (string, default: "displayName")
- `sortDir` (string, default: "asc")

**Response** (`200 OK`): Page<UserDetailResponse>

#### GET /user-details/search/display-name?displayName={name}

Search users by display name.

**Query Parameters**:

- `displayName` (string): Search term

**Response** (`200 OK`): List<UserDetailResponse>

#### GET /user-details/search/username?username={username}

Search users by username.

**Query Parameters**:

- `username` (string): Username

**Response** (`200 OK`): List<UserDetailResponse>

#### PUT /user-details/{userDetailId}

Update user detail.

**Path Parameters**:

- `userDetailId` (string): User detail ID

**Request Body** (multipart/form-data):

- `displayName` (string, optional)
- `bio` (string, optional)
- `shownName` (string, optional)
- `avatar` (MultipartFile, optional)

**Response** (`200 OK`): Updated UserDetailResponse

#### PATCH /user-details/{userDetailId}/avatar

Update user avatar only.

**Path Parameters**:

- `userDetailId` (string): User detail ID

**Request Body** (multipart/form-data):

- `avatar` (MultipartFile, required)

**Response** (`200 OK`): Updated UserDetailResponse

#### DELETE /user-details/{userDetailId}

Delete user detail.

**Path Parameters**:

- `userDetailId` (string): User detail ID

**Response** (`204 No Content`)

#### POST /user-details/follow/{targetUserDetailId}

Follow a user.

**Path Parameters**:

- `targetUserDetailId` (string): Target user detail ID

**Response** (`200 OK`): Updated UserDetailResponse

#### DELETE /user-details/unfollow/{targetUserDetailId}

Unfollow a user.

**Path Parameters**:

- `targetUserDetailId` (string): Target user detail ID

**Response** (`200 OK`): Updated UserDetailResponse

#### GET /user-details/{userDetailId}/followers

Get user's followers.

**Path Parameters**:

- `userDetailId` (string): User detail ID

**Response** (`200 OK`): List<UserDetailResponse>

#### GET /user-details/{userDetailId}/following

Get users that user is following.

**Path Parameters**:

- `userDetailId` (string): User detail ID

**Response** (`200 OK`): List<UserDetailResponse>

#### GET /user-details/{userDetailId}/is-following/{targetUserDetailId}

Check if user is following target.

**Path Parameters**:

- `userDetailId` (string): User detail ID
- `targetUserDetailId` (string): Target user detail ID

**Response** (`200 OK`): Boolean

---

### Feed Endpoints

#### GET /feed

Get feed items (videos, image slides).

**Query Parameters**:

- `page` (int, default: 0)
- `size` (int, default: 10)

**Response** (`200 OK`):

```json
{
  "code": 1000,
  "message": "Feed items retrieved successfully",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": {
    "content": [
      {
        "id": "feed_item_id",
        "feedItemType": "VIDEO",
        "video": {
          // Video data
        },
        "likeCount": 1000,
        "commentCount": 50,
        "shareCount": 20
      }
    ],
    "totalElements": 100,
    "totalPages": 10,
    "currentPage": 0,
    "pageSize": 10
  }
}
```

---

#### GET /feed/personal

Get personalized recommendations for the authenticated user.

**Headers**: Requires authentication

**Query Parameters**: Same as `GET /feed`

**Response** (`200 OK`): `Page<FeedItemResponse>`

---

#### GET /feed/explore

Get trending content for discovery (non-personalized but filtered to exclude items you've already consumed).

**Headers**: Requires authentication

**Query Parameters**: Same as `GET /feed`

**Response** (`200 OK`): `Page<FeedItemResponse>`

---

#### GET /feed/following

Get posts created by creators the user follows, sorted by recency.

**Headers**: Requires authentication

**Query Parameters**: Same as `GET /feed`

**Response** (`200 OK`): `Page<FeedItemResponse>`

---

#### POST /feed-items/{feedItemId}/view

Record a view for a feed item and add it to the authenticated user's watched list.

**Path Parameters**:

- `feedItemId` (string): ID of the feed item being viewed

**Headers**: Requires authentication

**Response** (`200 OK`):

```json
{
  "code": 1000,
  "message": "View recorded successfully",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": {
    "feedItemId": "feed_item_id",
    "viewsCount": 123,
    "watched": true
  }
}
```

---

#### GET /feed-items/loved

Get the authenticated user's loved feed items.

**Headers**: Requires authentication

**Query Parameters**:

- `page` (int, default: 0)
- `size` (int, default: 10)

**Response** (`200 OK`):

```json
{
  "code": 1000,
  "message": "Loved feed items retrieved successfully",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": {
    "content": [
      {
        "id": "feed_item_id",
        "feedItemType": "VIDEO",
        "loved": true,
        "likeCount": 123,
        "uploader": {
          "id": "user_detail_id",
          "displayName": "Creator"
        }
      }
    ],
    "totalElements": 5,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 10
  }
}
```

---

### User Interaction Endpoints

#### POST /user-interactions

Persist a batch of user interaction events (views, watch stats). Requires authentication.

**Request Body** (`application/json`):

```json
[
  {
    "feedItemId": "feed_item_id",
    "userDetailId": "user_detail_id",
    "watchDuration": 42.5
  }
]
```

**Response** (`200 OK`):

```json
{
  "code": 1000,
  "message": "User interactions saved successfully",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": null
}
```

#### GET /user-interactions

Retrieve paginated user interactions for the admin dashboard. Requires ADMIN role.

**Query Parameters**:

- `page` (int, default: 0)
- `size` (int, default: 20)
- `sort` (string, default: `createdAt,DESC`)

**Response** (`200 OK`):

```json
{
  "code": 1000,
  "message": "Successful",
  "timestamp": "2025-01-27T12:00:00Z",
  "result": {
    "content": [
      {
        "id": "interaction_id",
        "userId": "user_detail_id",
        "feedItemId": "feed_item_id",
        "interactionType": "VIEW",
        "duration": 42.5,
        "timestamp": "2025-01-27T11:55:00Z"
      }
    ],
    "totalElements": 120,
    "totalPages": 6,
    "number": 0,
    "size": 20
  }
}
```

#### GET /user-interactions/user/{userDetailId}

Retrieve paginated interactions for a specific user detail ID. Requires ADMIN role.

**Path Parameters**:

- `userDetailId` (string): ID of the user detail document.

**Query Parameters**: Same as `GET /user-interactions`.

**Response** (`200 OK`): Same structure as `GET /user-interactions`.

---

## WebSocket Endpoints

### WebSocket Connection

**Endpoint**: `/ws-native`

**Protocol**: SockJS + STOMP

**Authentication**: JWT token in query parameter or handshake header

**Connection**:

```javascript
const socket = new SockJS("http://localhost:8082/api/v1/ws-native");
const stompClient = Stomp.over(socket);
stompClient.connect({}, onConnected, onError);
```

### WebSocket Destinations

#### Message Subscriptions

**User-Specific Queue**: `/user/{userId}/queue/messages`

Receive messages for specific user:

```javascript
stompClient.subscribe(`/user/${userId}/queue/messages`, (message) => {
  const data = JSON.parse(message.body);
  // Handle message
});
```

#### Topic Subscriptions

**Conversation Topic**: `/topic/conversations/{conversationId}`

Receive messages in a conversation:

```javascript
stompClient.subscribe(`/topic/conversations/${conversationId}`, (message) => {
  const data = JSON.parse(message.body);
  // Handle conversation message
});
```

### Sending Messages

**Send to User**:

```javascript
stompClient.send(
  "/app/message",
  {},
  JSON.stringify({
    recipientId: "user_id",
    message: "Hello!",
  })
);
```

**Send to Conversation**:

```javascript
stompClient.send(
  "/app/conversation/message",
  {},
  JSON.stringify({
    conversationId: "conversation_id",
    message: "Hello group!",
  })
);
```

## Rate Limiting

Currently, rate limiting is **not implemented**. Future implementation will include:

- Per-IP rate limiting
- Per-user rate limiting
- Endpoint-specific limits

## Pagination

### Request Pagination

**Query Parameters**:

- `page`: Page number (0-indexed, default: 0)
- `size`: Page size (default: 10)

**Example**:

```
GET /api/v1/videos?page=0&size=20
```

### Response Pagination

All paginated responses include:

```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 10,
  "number": 0,
  "size": 10,
  "first": true,
  "last": false,
  "numberOfElements": 10
}
```

### Sorting

**Query Parameters**:

- `sort`: Comma-separated sort fields with direction

**Example**:

```
GET /api/v1/videos?sort=createdAt,DESC&sort=title,ASC
```

## Related Documents

- [BACKEND_RULES.md](./BACKEND_RULES.md) - Backend development guidelines
- [AUTHENTICATION_FLOW.md](./AUTHENTICATION_FLOW.md) - Authentication details
- [ERROR_HANDLING.md](./ERROR_HANDLING.md) - Error handling strategy

## Change Log

| Version | Date       | Changes         | Author       |
| ------- | ---------- | --------------- | ------------ |
| 1.0     | 2025-01-27 | Initial version | Backend Team |
