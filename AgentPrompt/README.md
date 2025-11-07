# The Social - Documentation Index

> **Last Updated**: 2025-01-27

Welcome to The Social project documentation. This folder contains comprehensive documentation covering all aspects of the TikTok clone application.

## Quick Start

New to the project? Start here:

1. **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - High-level overview of the project
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design patterns
3. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database structure and schemas

## Documentation Files

### Core Documentation

| Document                                           | Description                                     | Audience      |
| -------------------------------------------------- | ----------------------------------------------- | ------------- |
| **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)**   | Project purpose, tech stack, features, timeline | All           |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)**           | System architecture, components, patterns       | Developers    |
| **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**     | MongoDB collections, relationships, indexing    | Backend Devs  |
| **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** | Complete API endpoint reference                 | API Consumers |

### Development Guidelines

| Document                                                     | Description                         | Audience      |
| ------------------------------------------------------------ | ----------------------------------- | ------------- |
| **[BACKEND_RULES.md](./BACKEND_RULES.md)**                   | Spring Boot development standards   | Backend Devs  |
| **[FRONTEND_MOBILE_RULES.md](./FRONTEND_MOBILE_RULES.md)**   | React Native development guidelines | Mobile Devs   |
| **[FRONTEND_WEB_RULES.md](./FRONTEND_WEB_RULES.md)**         | Next.js development guidelines      | Frontend Devs |
| **[CODE_REVIEW_GUIDELINES.md](./CODE_REVIEW_GUIDELINES.md)** | Code review process and checklist   | All Devs      |

### Process Documentation

| Document                                               | Description                            | Audience      |
| ------------------------------------------------------ | -------------------------------------- | ------------- |
| **[AUTHENTICATION_FLOW.md](./AUTHENTICATION_FLOW.md)** | Authentication and authorization flows | All Devs      |
| **[WORKFLOWS.md](./WORKFLOWS.md)**                     | User workflows and sequences           | Product, Devs |
| **[ERROR_HANDLING.md](./ERROR_HANDLING.md)**           | Error handling strategy                | All Devs      |

## Getting Started

### For New Developers

1. Read [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Set up your development environment
4. Read relevant rules document:
   - Backend → [BACKEND_RULES.md](./BACKEND_RULES.md)
   - Mobile → [FRONTEND_MOBILE_RULES.md](./FRONTEND_MOBILE_RULES.md)
   - Web → [FRONTEND_WEB_RULES.md](./FRONTEND_WEB_RULES.md)

### For API Consumers

1. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Review [AUTHENTICATION_FLOW.md](./AUTHENTICATION_FLOW.md)
3. Understand error codes in [ERROR_HANDLING.md](./ERROR_HANDLING.md)

### For Product/QA Teams

1. Read [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
2. Review [WORKFLOWS.md](./WORKFLOWS.md)
3. Use [CODE_REVIEW_GUIDELINES.md](./CODE_REVIEW_GUIDELINES.md) for testing

## Tech Stack Summary

### Backend

- **Framework**: Spring Boot 3.3.5
- **Language**: Java 17
- **Database**: MongoDB
- **Security**: JWT + OAuth2
- **Messaging**: Apache Kafka
- **Real-time**: WebSocket (STOMP)

### Mobile

- **Framework**: Expo 54.0
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State**: Zustand, Redux
- **Styling**: NativeWind (TailwindCSS)

### Web Admin

- **Framework**: Next.js 15.5.4
- **Router**: App Router
- **UI**: Radix UI + shadcn
- **State**: React Query, Zustand
- **Styling**: TailwindCSS 4.0

## Project Structure

```
TiktokClone/
├── backend/              # Spring Boot API
├── mobile-app/           # React Native App
├── admin-portal/         # Next.js Admin Portal
├── uploads/              # File Storage
└── AgentPrompt/          # Documentation (this folder)
```

## Key Features

- ✅ User Authentication (JWT)
- ✅ Video Upload & Processing
- ✅ Real-time Messaging (WebSocket)
- ✅ Feed Generation
- ✅ Social Interactions (Like, Comment, Share)
- ✅ AI Chat Assistant
- ✅ Admin Portal
- ✅ Role-Based Access Control

## Quick Links

- [API Base URL](./API_DOCUMENTATION.md#base-url): `http://localhost:8082/api/v1`
- [Backend Repository](./BACKEND_RULES.md): Spring Boot best practices
- [Database Collections](./DATABASE_SCHEMA.md#collections): MongoDB schemas
- [Authentication](./AUTHENTICATION_FLOW.md): JWT-based auth

## Contributing

When contributing code, please:

1. Follow the relevant rules document (Backend/Mobile/Web)
2. Run all tests before submitting PR
3. Ensure code coverage > 80%
4. Update documentation if adding new features
5. Follow [CODE_REVIEW_GUIDELINES.md](./CODE_REVIEW_GUIDELINES.md)

## Support

For questions or issues:

- Backend issues: See [BACKEND_RULES.md](./BACKEND_RULES.md)
- API issues: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Architecture questions: See [ARCHITECTURE.md](./ARCHITECTURE.md)

---

**Version**: 1.0  
**Last Updated**: 2025-01-27  
**Maintained By**: Development Team
