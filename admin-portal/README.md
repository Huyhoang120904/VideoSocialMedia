# TikTok Clone Admin Portal

A comprehensive admin portal for managing the TikTok Clone platform.

## Features

- **Dashboard**: Overview of platform statistics and recent activities
- **User Management**: Manage users, content creators, and moderators
- **Content Management**: Monitor videos, flagged content, and comments
- **Analytics**: Detailed analytics and insights
- **Settings**: Platform configuration and preferences

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables (optional):

Create a `.env.local` file in the admin-portal directory with:

```bash
# Backend API URL - Update this to match your backend server
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8082/api/v1
```

**Note**: If you don't create this file, the admin portal will use the default backend URL `http://localhost:8082/api/v1`.

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend Integration

The admin portal is fully integrated with the Spring Boot backend. Make sure your backend is running on `http://localhost:8082` before starting the admin portal.

### Backend Requirements

- Spring Boot backend running on port 8082
- MongoDB database
- JWT authentication enabled
- CORS configured for `http://localhost:3000`

## Demo Credentials

- **Email**: admin@tiktokclone.com
- **Password**: admin123

## Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Authentication**: Custom JWT implementation
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (admin)/           # Admin routes
│   ├── (auth)/            # Authentication routes
│   └── api/               # API routes
├── components/            # React components
│   ├── admin/             # Admin-specific components
│   ├── auth/              # Authentication components
│   ├── common/            # Shared components
│   └── ui/                # UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── config/                 # Configuration files
└── constants/              # Constants and enums
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
