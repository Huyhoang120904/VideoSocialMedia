# User Workflows

> **Version**: 1.0
> **Last Updated**: 2025-01-27
> **Owner**: Product Team

## Table of Contents

- [User Registration and Onboarding](#user-registration-and-onboarding)
- [Content Creation Flow](#content-creation-flow)
- [Content Interaction Flow](#content-interaction-flow)
- [Search and Discovery](#search-and-discovery)
- [Messaging Flow](#messaging-flow)
- [AI Chat Assistant Flow](#ai-chat-assistant-flow)

## User Registration and Onboarding

### Registration Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant MA as Mobile App
    participant API as Backend API
    participant DB as MongoDB

    U->>MA: Open Register screen
    MA->>U: Display registration form
    U->>MA: Enter username, email, password
    MA->>API: POST /users (registration)
    API->>DB: Create user document
    API->>API: Hash password (BCrypt)
    DB-->>API: User created
    API-->>MA: 201 Created
    MA->>MA: Auto-login with credentials
    MA->>API: POST /auth/token
    API-->>MA: Access token
    MA->>U: Navigate to Home screen
```

### Onboarding Steps

1. **Account Creation**

   - User enters username, email, password
   - Server validates uniqueness of username and email
   - Password is hashed and stored

2. **Profile Setup**

   - User is prompted to add profile picture
   - User can add display name and bio
   - Optional: Import contacts

3. **Content Recommendations**
   - First-time feed generation
   - Suggested users to follow
   - Trending content display

## Content Creation Flow

### Video Upload Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant MA as Mobile App
    participant API as Backend API
    participant FS as File Storage
    participant AI as AI Service
    participant DB as MongoDB

    U->>MA: Tap Upload button
    MA->>U: Show camera/gallery picker
    U->>MA: Select/Record video
    MA->>MA: Preview video
    U->>MA: Add title, description, hashtags
    U->>MA: Tap Upload
    MA->>API: POST /videos/upload (multipart)
    API->>FS: Save video file
    FS-->>API: File saved
    API->>API: Generate thumbnail (FFmpeg)
    API->>AI: Extract hashtags (optional)
    API->>DB: Create video document
    DB-->>API: Video saved
    API->>DB: Update metadata
    API-->>MA: Video uploaded (ID, URL)
    MA->>U: Show success + navigate to feed
```

### Upload Steps

1. **Video Selection**

   - User opens camera or gallery
   - Selects or records video (max 60 seconds)
   - Video is compressed if needed

2. **Video Processing**

   - Server receives video file
   - Generates thumbnail at 1-second mark
   - Extracts duration and metadata
   - Stores in `/uploads/{user_id}/`

3. **Metadata Creation**

   - Creates video document in MongoDB
   - Links to uploader (UserDetail)
   - Associates hashtags
   - Creates FeedItem for discovery

4. **Distribution**
   - Video appears in user's profile
   - Added to feed algorithm
   - Notification to followers (optional)

## Content Interaction Flow

### Like/Comment/Share Flow

```mermaid
sequenceDiagram
    participant U as User
    participant MA as Mobile App
    participant API as Backend API
    participant WS as WebSocket
    participant DB as MongoDB
    participant OC as Other Clients

    U->>MA: Double-tap video (like)
    MA->>API: PATCH /feed/{itemId}/like
    API->>DB: Update like_count
    DB-->>API: Updated
    API->>WS: Broadcast like event
    WS-->>OC: Push notification to video owner
    API-->>MA: Like count updated
    MA->>U: Show updated like count

    U->>MA: Tap comment button
    MA->>U: Show comment modal
    U->>MA: Type comment + submit
    MA->>API: POST /comments
    API->>DB: Create comment document
    API->>WS: Broadcast new comment
    API-->>MA: Comment created
    MA->>U: Display comment in list
```

### Interaction Types

**Like**:

- Double-tap on video or tap like button
- Increment counter
- Broadcast to author via WebSocket
- Store in user's liked items

**Comment**:

- Open comment section
- Type comment text
- Optional: Reply to existing comment
- Store in nested structure

**Share**:

- Tap share button
- Choose platform (external apps)
- Track share_count in metadata
- Generate shareable link

## Search and Discovery

### Feed Algorithm Flow

```mermaid
graph TD
    A[User Opens App] --> B{Feed Type?}
    B -->|For You| C[Aggregate Feed]
    B -->|Following| D[Following Feed]
    B -->|Hot| E[Trending Feed]

    C --> F[Query MongoDB]
    F --> G[Sort by Engagement Score]
    G --> H[Return Pageable Results]

    D --> I[Query User's Followings]
    I --> J[Get Recent Videos]
    J --> K[Sort by Date]

    E --> L[Query Most Liked]
    L --> M[Time Window: 24h]
    M --> N[Sort by Likes]
```

### Discovery Mechanism

1. **For You Feed**

   - Aggregate all videos from all users
   - Sort by engagement score: `(likes × 2 + comments + shares) / age_in_hours`
   - Time decay: Recent content prioritized

2. **Following Feed**

   - Query videos from followed users only
   - Sort by creation date (newest first)

3. **Trending/Hot**
   - Videos with high engagement in last 24 hours
   - Formula: `(likes + comments × 2 + shares × 3) / views`

## Messaging Flow

### Direct Message Flow

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant U2 as User 2
    participant MA as Mobile App
    participant API as Backend API
    participant WS as WebSocket
    participant DB as MongoDB

    U1->>MA: Open chat with User 2
    MA->>API: GET /conversations/{id}
    API->>DB: Fetch conversation
    DB-->>API: Conversation data
    API-->>MA: Messages (paginated)

    U1->>MA: Type message + send
    MA->>API: POST /chat-messages
    API->>DB: Save message
    API->>WS: Broadcast message
    DB-->>API: Message saved
    API-->>MA: Message sent

    WS->>MA: Receive message (User 2)
    MA->>U2: Show notification + message
    U2->>MA: Mark as read
    MA->>API: POST /chat-messages/{id}/read
    API->>DB: Update read_participants_id
    WS->>MA: Broadcast read receipt (User 1)
```

### Real-time Messaging Features

**Message Delivery**:

- WebSocket connection per user
- Subscribe to user-specific queue: `/user/{userId}/queue/messages`
- Receive real-time message delivery

**Read Receipts**:

- Track read participants in message document
- Broadcast read status via WebSocket
- Update UI with read indicators

**Group Messaging**:

- Multiple participants in conversation
- Group-specific topics: `/topic/conversations/{id}`
- Admin controls: Add/remove members

## AI Chat Assistant Flow

### AI Chat Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant MA as Mobile App
    participant API as Backend API
    participant AI as OpenAI API
    participant DB as MongoDB

    U->>MA: Tap AI Assistant
    MA->>API: GET /chat-messages/ai/conversation
    API->>DB: Fetch or create AI conversation
    DB-->>API: Conversation ID
    API-->>MA: Conversation data

    U->>MA: Type message: "What is React Native?"
    MA->>API: POST /chat-messages/ai
    API->>DB: Save user message
    API->>AI: Chat completion request
    AI-->>API: AI response
    API->>DB: Save AI message (role: "assistant")
    API-->>MA: AI response
    MA->>U: Display AI response

    Note over U,AI: Conversation history persists<br/>for context in future messages
```

### AI Features

**Conversational Context**:

- Spring AI manages conversation memory
- Stores messages in MongoDB with role ("user" or "assistant")
- Context-aware responses

**Custom Prompts**:

- AI can answer questions about the app
- Provide user support
- Explain features and functionalities

**Session Management**:

- Each user has dedicated AI conversation
- Conversation ID preserved across sessions
- Memory persists across app restarts

## Related Documents

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Endpoint reference
- [AUTHENTICATION_FLOW.md](./AUTHENTICATION_FLOW.md) - Authentication details

## Change Log

| Version | Date       | Changes         | Author       |
| ------- | ---------- | --------------- | ------------ |
| 1.0     | 2025-01-27 | Initial version | Product Team |
