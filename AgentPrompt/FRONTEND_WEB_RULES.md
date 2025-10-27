# Web Frontend Development Rules (Next.js)

> **Version**: 1.0
> **Last Updated**: 2025-01-27
> **Owner**: Frontend Team

## Table of Contents

- [Project Structure](#project-structure)
- [App Router Architecture](#app-router-architecture)
- [Component Organization](#component-organization)
- [State Management](#state-management)
- [Data Fetching](#data-fetching)
- [Styling](#styling)
- [Testing](#testing)

## Project Structure

```
admin-portal/
├── src/
│   ├── app/                 # App Router pages
│   │   ├── (admin)/
│   │   │   └── admin/        # Admin layout group
│   │   │       ├── analytics/
│   │   │       ├── dashboard/
│   │   │       ├── settings/
│   │   │       ├── users/
│   │   │       └── videos/
│   │   ├── api/             # API routes
│   │   │   └── auth/
│   │   ├── login/           # Public pages
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── admin/           # Admin components
│   │   ├── common/          # Shared components
│   │   └── ui/              # UI components (shadcn)
│   ├── hooks/               # Custom hooks
│   ├── services/            # API services
│   ├── lib/                 # Utilities
│   └── config/              # Configuration
```

## App Router Architecture

### Routing Structure

```
app/
├── (admin)/                # Layout group
│   └── admin/              # Admin pages (require auth)
│       ├── layout.tsx     # Admin layout with sidebar
│       ├── dashboard/
│       └── users/
└── login/                  # Public pages
    └── page.tsx           # Login page
```

### Server vs Client Components

**Server Component** (default):

```typescript
// app/admin/users/page.tsx
export default async function UsersPage() {
  const users = await fetchUsers(); // Server-side data fetching

  return (
    <div>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

**Client Component**:

```typescript
"use client";

import { useState } from "react";

export function UserForm() {
  const [name, setName] = useState("");
  // Client-side interactivity
}
```

## Component Organization

### Atomic Design Pattern

```
components/
├── ui/                    # Atomic (shadcn)
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
├── common/                # Molecules
│   ├── Logout.tsx
│   └── Header.tsx
└── admin/                 # Organisms
    ├── AdminSidebar.tsx
    └── UserTable.tsx
```

### Component Pattern

```typescript
// components/admin/UserTable.tsx
import { Table } from "@/components/ui/table";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
}

export function UserTable({ users, onEdit }: UserTableProps) {
  return <Table>{/* Table implementation */}</Table>;
}
```

## State Management

### React Query (Server State)

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation } from "@tanstack/react-query";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/v1/users");
      return response.json();
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: User) => {
      return await userService.create(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

### Zustand (Client State)

```typescript
// hooks/useAuthStore.ts
import create from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

## Data Fetching

### Server Components

```typescript
// app/admin/users/page.tsx
export default async function UsersPage() {
  const users = await fetchUsers(); // Direct server fetch

  return <UsersList users={users} />;
}
```

### Client Components with React Query

```typescript
"use client";

export function UsersList() {
  const { data: users, isLoading } = useUsers();

  if (isLoading) return <div>Loading...</div>;

  return users.map((user) => <UserCard key={user.id} user={user} />);
}
```

## Styling

### TailwindCSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### shadcn/ui Components

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function UserCard({ user }) {
  return (
    <Card>
      <CardContent>
        <h3>{user.name}</h3>
        <Button>Edit</Button>
      </CardContent>
    </Card>
  );
}
```

## Testing

### Component Testing

```typescript
import { render, screen } from "@testing-library/react";

test("renders user table", () => {
  render(<UserTable users={mockUsers} />);
  expect(screen.getByText("John Doe")).toBeInTheDocument();
});
```

## Related Documents

- [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Change Log

| Version | Date       | Changes         | Author        |
| ------- | ---------- | --------------- | ------------- |
| 1.0     | 2025-01-27 | Initial version | Frontend Team |
