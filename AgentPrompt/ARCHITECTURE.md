# System Architecture

> **Version**: 1.0
> **Last Updated**: 2025-01-27
> **Owner**: Backend Team

## Table of Contents

- [Overview](#overview)
- [Architecture Pattern](#architecture-pattern)
- [Component Diagram](#component-diagram)
- [Layer Responsibilities](#layer-responsibilities)
- [Communication Patterns](#communication-patterns)
- [Data Flow](#data-flow)
- [Technology Choices](#technology-choices)
- [Scalability Considerations](#scalability-considerations)
- [Security Architecture](#security-architecture)

## Overview

The Social follows a **Layered Monolithic Architecture** with clear separation of concerns. The application consists of three main parts:

1. **Backend API**: Spring Boot RESTful API
2. **Mobile Client**: React Native application
3. **Admin Portal**: Next.js web application

## Architecture Pattern

### Layered Monolithic Architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        CONT[Controllers<br/>REST API Endpoints]
        WS[WebSocket Handlers<br/>STOMP Protocol]
    end

    subgraph "Business Logic Layer"
        AS[Authentication Service]
        VS[Video Service]
        US[User Service]
        CS[Chat Service]
        FES[Feed Service]
        FS[File Service]
    end

    subgraph "Data Access Layer"
        REPO[Repositories<br/>MongoDB Interfaces]
        ENT[Entities<br/>Domain Models]
    end

    subgraph "Cross-cutting Concerns"
        SEC[Security<br/>JWT + OAuth2]
        KAFKA[Kafka<br/>Async Messaging]
        AI[AI Integration<br/>OpenAI]
    end

    CONT --> AS
    CONT --> VS
    CONT --> US
    CONT --> CS
    CONT --> FES
    WS --> CS
    WS --> KAFKA

    AS --> REPO
    VS --> REPO
    US --> REPO
    CS --> REPO
    FES --> REPO
    FS --> REPO

    REPO --> ENT

    style CONT fill:#3b82f6,color:#fff
    style SEC fill:#ef4444,color:#fff
    style KAFKA fill:#f59e0b,color:#fff
```

## Component Diagram

```mermaid
graph LR
    subgraph "Client Applications"
        MA[Mobile App<br/>React Native]
        AP[Admin Portal<br/>Next.js]
    end

    subgraph "API Gateway"
        SB[Spring Boot Application<br/>Port 8082<br/>Context: /api/v1]
    end

    subgraph "Core Modules"
        UM[User Module]
        VM[Video Module]
        CM[Chat Module]
        FM[File Module]
        FEEDM[Feed Module]
        ADM[Admin Module]
        AIM[AI Module]
    end

    subgraph "Infrastructure"
        MDB[(MongoDB)]
        FS[File System<br/>/uploads]
        K[Kafka Broker]
        CDN[Cloudinary CDN]
    end

    subgraph "External Services"
        OPENAI[OpenAI API]
    end

    MA --> SB
    AP --> SB

    SB --> UM
    SB --> VM
    SB --> CM
    SB --> FM
    SB --> FEEDM
    SB --> ADM
    SB --> AIM

    UM --> MDB
    VM --> MDB
    CM --> MDB
    FM --> FS
    FM --> CDN
    FEEDM --> MDB
    ADM --> MDB
    AIM --> MDB
    AIM --> OPENAI

    CM --> K
    K --> SB

    style SB fill:#2563eb,color:#fff
    style MDB fill:#10b981,color:#fff
    style K fill:#f59e0b,color:#fff
    style OPENAI fill:#8b5cf6,color:#fff
```

## Layer Responsibilities

### 1. Presentation Layer (Controllers)

**Location**: `com.hehe.thesocial.controller`

**Responsibilities**:

- Handle HTTP requests and responses
- Request validation
- Response mapping
- Error handling delegation
- Authentication/Authorization enforcement

**Key Controllers**:

- `AuthenticationController`: Login, logout, token refresh
- `VideoController`: Video upload, retrieval, management
- `ChatMessageController`: Message CRUD operations
- `ConversationController`: Conversation management
- `UserController`: User profile operations
- `FeedController`: Feed generation and retrieval

### 2. Business Logic Layer (Services)

**Location**: `com.hehe.thesocial.service`

**Responsibilities**:

- Implement business rules
- Transaction management
- Data transformation
- Orchestrate multiple repositories
- Business logic validation

**Key Services**:

- `AuthenticationService`: JWT generation, validation
- `VideoService`: Video processing, thumbnails
- `ChatMessageService`: Message handling, delivery
- `FeedService`: Feed algorithm, aggregation
- `FileService`: File upload, storage management

### 3. Data Access Layer (Repositories)

**Location**: `com.hehe.thesocial.repository`

**Responsibilities**:

- Database operations
- Query optimization
- CRUD operations
- Custom queries

**Repositories**:

- `UserRepository`
- `VideoRepository`
- `ChatMessageRepository`
- `ConversationRepository`
- `FeedItemRepository`
- `FileRepository`

### 4. Domain Models (Entities)

**Location**: `com.hehe.thesocial.entity`

**Responsibilities**:

- Domain modeling
- Data structure definition
- Relationship mapping (@DBRef)
- Validation rules

### 5. Cross-cutting Concerns

#### Security Configuration

- **Location**: `com.hehe.thesocial.config.SecuritySetting`
- **Pattern**: OAuth2 Resource Server with JWT
- **Implementation**: Spring Security filter chain
- **Custom**: `CustomJwtDecoder` for JWT validation

#### WebSocket Configuration

- **Location**: `com.hehe.thesocial.config.WebSocketConfig`
- **Protocol**: STOMP over WebSocket
- **Purpose**: Real-time messaging
- **Handshake**: Custom interceptor for JWT validation

#### Kafka Configuration

- **Location**: `com.hehe.thesocial.config.KafkaConfig`
- **Purpose**: Async event processing
- **Topics**: Message delivery, feed updates

## Communication Patterns

### RESTful API Communication

```mermaid
sequenceDiagram
    participant C as Client
    participant FW as Filter Chain
    participant CT as Controller
    participant SV as Service
    participant REP as Repository
    participant DB as MongoDB

    C->>FW: HTTP Request
    FW->>FW: Authentication Check
    FW->>FW: CORS Check
    FW->>CT: Authorized Request
    CT->>CT: Request Validation
    CT->>SV: Business Method Call
    SV->>REP: Data Access
    REP->>DB: Query Execution
    DB-->>REP: Results
    REP-->>SV: Data Objects
    SV-->>CT: Business Objects
    CT-->>C: JSON Response
```

### WebSocket Communication

```mermaid
sequenceDiagram
    participant C as Client
    participant WS as WebSocket Config
    participant INT as Handshake Interceptor
    participant LIST as WebSocket Listener
    participant SVC as Chat Service

    C->>WS: WebSocket Connect
    WS->>INT: Handshake Request
    INT->>INT: Validate JWT Token
    INT-->>WS: Authorization Result
    WS-->>C: Connection Established

    C->>LIST: STOMP Message
    LIST->>SVC: Process Message
    SVC-->>LIST: Response
    LIST-->>C: Broadcast Message
```

### Kafka Async Processing

```mermaid
sequenceDiagram
    participant SVC as Service
    participant KP as Kafka Producer
    participant KAFKA as Kafka Broker
    participant KC as Kafka Consumer
    participant WS as WebSocket

    SVC->>KP: Send Message
    KP->>KAFKA: Publish Event
    KAFKA->>KC: Consume Event
    KC->>KC: Process Event
    KC->>WS: Broadcast Update
    WS-->>Clients: Real-time Notification
```

## Data Flow

### Video Upload Flow

```mermaid
graph LR
    A[Client Upload] --> B[VideoController]
    B --> C[VideoService]
    C --> D[FileService]
    D --> E{Storage Type}
    E -->|Local| F[File System]
    E -->|Cloud| G[Cloudinary]
    C --> H[Generate Thumbnail]
    H --> I[JavaCV/FFmpeg]
    C --> J[VideoRepository]
    J --> K[(MongoDB)]
```

### Feed Generation Flow

```mermaid
graph TD
    A[Client Request] --> B[FeedController]
    B --> C[FeedService]
    C --> D{Feed Type}
    D -->|For You| E[Aggregate Data]
    D -->|Following| F[User's Followers]
    D -->|Hot| G[Popular Content]
    E --> H[FeedItemRepository]
    F --> H
    G --> H
    H --> I[(MongoDB)]
    I --> J[Pageable Results]
    J --> B
    B --> K[JSON Response]
```

### Real-time Messaging Flow

```mermaid
graph TD
    A[Client A Send Message] --> B[ChatMessageController]
    B --> C[ChatMessageService]
    C --> D[ChatMessageRepository]
    D --> E[(Save to MongoDB)]
    C --> F[Kafka Producer]
    F --> G{Kafka Topic}
    G --> H[Message Delivery Event]
    H --> I[Kafka Consumer]
    I --> J[WebSocket Listener]
    J --> K[Broadcast to Client B]
    J --> L[Broadcast to Client A]
```

## Technology Choices

### Backend Framework: Spring Boot 3.3.5

**Rationale**:

- **Mature Ecosystem**: Extensive libraries and community support
- **Production Ready**: Battle-tested framework
- **Dependency Injection**: IoC container for loose coupling
- **Security**: Built-in Spring Security integration
- **Documentation**: OpenAPI/Swagger support

**Version**: 3.3.5 (Latest stable as of 2024)

### Database: MongoDB

**Rationale**:

- **Document Model**: Fits social media data structure (nested objects)
- **Flexible Schema**: Easy to evolve as requirements change
- **Horizontal Scaling**: Sharding support for growth
- **Performance**: Fast reads for feed generation
- **DBRef**: Maintains references between documents

**Collections**:

- users, user_details, roles, permissions
- videos, comments, feed_items
- chat_message, conversations
- file_documents

### Security: JWT + OAuth2 Resource Server

**Rationale**:

- **Stateless**: No server-side session management
- **Scalable**: Works across multiple instances
- **Industry Standard**: OAuth2 compliance
- **Custom Decoder**: Full control over token validation
- **Refresh Tokens**: Enhanced security

### Real-time: WebSocket + STOMP

**Rationale**:

- **Bidirectional**: Server can push updates
- **STOMP Protocol**: Standard messaging protocol
- **Scalable**: Can scale horizontally
- **Integration**: Works with Spring Messaging

### Async Processing: Apache Kafka

**Rationale**:

- **Decoupling**: Services don't block on processing
- **Reliability**: Message persistence and retry
- **Scalability**: Can handle high message volumes
- **Integration**: Spring Kafka simplifies implementation

### AI Integration: Spring AI

**Rationale**:

- **Abstraction**: Vendor-agnostic AI integration
- **OpenAI Support**: GPT model integration
- **Memory**: Conversation context management
- **Chat Support**: Built-in chat capabilities

## Scalability Considerations

### Current Architecture (Single Instance)

```mermaid
graph LR
    A[Load Balancer] --> B[Spring Boot Instance]
    B --> C[(MongoDB)]
    B --> D[File System]
    B --> E[Kafka]
```

### Horizontal Scaling Strategy

```mermaid
graph TD
    A[Load Balancer] --> B1[Instance 1]
    A --> B2[Instance 2]
    A --> B3[Instance 3]

    B1 --> C[(MongoDB<br/>Replica Set)]
    B2 --> C
    B3 --> C

    B1 --> D[Shared Storage<br/>NAS/S3]
    B2 --> D
    B3 --> D

    B1 --> E[Kafka Cluster]
    B2 --> E
    B3 --> E
```

### Scalability Techniques

1. **Stateless Application**: JWT tokens enable multiple instances
2. **Database Sharding**: MongoDB sharding by user_id or video_id
3. **File Storage**: Migrate to S3/Cloudinary for CDN
4. **Caching**: Redis for frequently accessed data
5. **Read Replicas**: MongoDB replica sets for read scaling
6. **Async Processing**: Kafka for heavy operations

## Security Architecture

### Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant FB as Filter Chain
    participant DEC as JWT Decoder
    participant SEC as Security Context

    C->>FB: Request with JWT
    FB->>DEC: Validate Token
    DEC->>DEC: Check Signature
    DEC->>DEC: Check Expiration
    DEC-->>FB: Claims
    FB->>FB: Extract Authorities
    FB->>SEC: Set Authentication
    FB-->>C: Authorized Request
```

### Security Layers

1. **Transport Layer**: HTTPS for all communications
2. **Authentication**: JWT token validation
3. **Authorization**: Role-based access control (RBAC)
4. **CORS**: Configured for allowed origins
5. **Input Validation**: Jakarta Bean Validation
6. **Password Hashing**: BCrypt with strength 12
7. **Token Storage**: Secure storage on client (Expo SecureStore)
8. **File Upload**: Size limits (50MB), type validation

### Security Configuration

**Security Settings**:

- Public endpoints: `/auth/**`, `/files/**`, `/videos/**`
- Protected endpoints: Require authentication
- Admin endpoints: Require ADMIN role
- CORS: Configurable via `${CORS_URL}`
- CSRF: Disabled (using JWT instead)

## Related Documents

- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - High-level project overview
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Database design details
- [BACKEND_RULES.md](./BACKEND_RULES.md) - Backend development guidelines

## Change Log

| Version | Date       | Changes         | Author       |
| ------- | ---------- | --------------- | ------------ |
| 1.0     | 2025-01-27 | Initial version | Backend Team |
