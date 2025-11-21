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

## Code Quality Patterns and Best Practices

### Server vs Client Component Guidelines

**Prefer Server Components when possible:**

```typescript
// ✅ Good - Server component for data fetching
// app/admin/users/page.tsx
export default async function UsersPage() {
  const users = await fetchUsers(); // Server-side fetch

  return <UsersList users={users} />;
}

// ❌ Bad - Client component for data fetching
("use client");
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetchUsers().then(setUsers); // Client-side fetch - unnecessary
  }, []);
  return <UsersList users={users} />;
}
```

**Use Client Components only for interactivity:**

```typescript
// ✅ Good - Client component for interactivity
"use client";

import { useState } from "react";

export function UserForm() {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Submit logic
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### React Query Patterns

**Proper Query Configuration:**

```typescript
// ✅ Good - Proper query configuration
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/v1/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
```

**Mutation with Optimistic Updates:**

```typescript
// ✅ Good - Mutation with optimistic updates
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: User) => {
      return await userService.create(user);
    },
    onMutate: async (newUser) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["users"] });

      // Snapshot previous value
      const previousUsers = queryClient.getQueryData(["users"]);

      // Optimistically update
      queryClient.setQueryData(["users"], (old: User[]) => [
        ...old,
        { ...newUser, id: "temp" },
      ]);

      return { previousUsers };
    },
    onError: (err, newUser, context) => {
      // Rollback on error
      queryClient.setQueryData(["users"], context.previousUsers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

### Error Handling Patterns

**Error Boundaries:**

```typescript
// ✅ Good - Error boundary
"use client";

import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
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

**React Query Error Handling:**

```typescript
// ✅ Good - React Query error handling
const { data, error, isLoading } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  onError: (error) => {
    toast.error(error.response?.data?.message || "Failed to load users");
  },
});

if (error) {
  return <ErrorDisplay error={error} />;
}
```

### Form Validation Patterns

**React Hook Form with Zod:**

```typescript
// ✅ Good - Form validation with Zod
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserFormData) => {
    // Submit logic
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("username")} />
      {errors.username && <span>{errors.username.message}</span>}

      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

### State Management Patterns

**Zustand Store Pattern:**

```typescript
// ✅ Good - Zustand store with TypeScript
import create from "zustand";
import { devtools, persist } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        isAuthenticated: false,
        user: null,
        login: (user) => set({ user, isAuthenticated: true }),
        logout: () => set({ user: null, isAuthenticated: false }),
      }),
      { name: "auth-storage" }
    )
  )
);
```

### Component Patterns

**Proper Component Structure:**

```typescript
// ✅ Good - Well-structured component
interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  isLoading?: boolean;
}

export function UserTable({
  users,
  onEdit,
  onDelete,
  isLoading,
}: UserTableProps) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (users.length === 0) {
    return <EmptyState message="No users found" />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Button onClick={() => onEdit(user)}>Edit</Button>
              <Button onClick={() => onDelete(user.id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Common Pitfalls to Avoid

1. **Don't use client components for data fetching** - Use server components
2. **Don't forget error boundaries** - Wrap components that might crash
3. **Don't forget loading states** - Show loading indicators
4. **Don't forget error states** - Handle and display errors
5. **Don't mutate query cache directly** - Use proper mutations
6. **Don't forget form validation** - Use Zod or similar
7. **Don't use inline styles** - Use TailwindCSS classes
8. **Don't forget TypeScript types** - Type all props and functions
9. **Don't forget empty states** - Provide helpful empty states
10. **Don't forget accessibility** - Use proper ARIA labels

## Change Log

| Version | Date       | Changes                                        | Author        |
| ------- | ---------- | ---------------------------------------------- | ------------- |
| 1.0     | 2025-01-27 | Initial version                                | Frontend Team |
| 1.1     | 2025-01-27 | Added code quality patterns and best practices | Frontend Team |
