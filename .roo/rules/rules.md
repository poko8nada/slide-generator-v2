You are a programming expert.

## Prerequisites
### 1. File Management and Task Execution
- Always reference the following md files before implementation, even without specific instructions:
  - `requirements.md` contains basic requirements and specifications
  - `todos.md` contains issues and tasks to execute
- Work must be based on items listed in `todos.md`; if task not present, confirm first and add with user approval
- After work completion, check off the corresponding item in `todos.md`
- Maintain traceability between requirements, tasks, and implementation

### 2. Communication Guidelines
- Keep user-facing content within 3 lines unless user requests detailed explanation
- Use concise, telegraphic style to minimize response volume
- Focus on actionable information and results
- Avoid unnecessary explanations or commentary

### 3. Token Management and Task Continuity
- Monitor subtask workload and token consumption
- When approaching 100k tokens, generate separate continuation task
- Transfer all necessary information for persistence including:
  - Completed work summary
  - Current progress state
  - Remaining tasks and context
  - Implementation decisions made
- Ensure seamless handoff between task segments

### 4. Documentation Creation Policy
- Do not create implementation md files unless explicitly instructed by user
- Do not ask user about documentation creation
- Focus on code implementation over documentation unless specified

---

## Coding Rules

- Use Next.js 14+ with App Router.
- Design by Functional Domain Modeling.
- Use function. Do not use `class`.
- Design types using Algebraic Data Types
- Use early return pattern to improve readability
- Avoid deep nesting with `else` statements
- Handle error cases first with early return
- Use standard JavaScript/TypeScript error handling (`try-catch`, `throw`)

## Project Structure

```
├src
│  ├app  // Directory structure reflects routing; only for placement and arrangement of features.
│  │  │ // Primarily server components to easily use 'async/await', etc.
│  │  ├dashboard   // When a screen has multi parts, parallel routes separate concerns via dir structure.
│  │  │  ├@modal  // Parallel route naming indicates the "part's" purpose.
│  │  │  ├@search
│  │  │  ┗page.tsx
│  │
│  ├components   // Reusable components, no logic. don't perform any process.
│  │  ├ui─*.tsx  // Reusable UI components
│  │  └*.tsx     // Feature components
│  │
│  ├config  // Initial object and its type (type) used in hooks and server actions.
│  │
│  ├feature // Collection of components that handle processing and rendering.
│  │  │    // Built by combining components. Imported into directories under 'app/'.
│  │  │    // Avoid nesting within features!
│  │  │    // Makes it hard to follow. Use 'children' and nest within 'app/'.
│  │  │    // Often become client components using useHook-like hooks. But server components are also OK.
│  │  │
│  │  ├search-feed  // Named by "what it does".
│  │  │  ├index.tsx
│  │  │  ┗action.ts
│  │  ├display-feed
│  │  │  ┗index.tsx
│  │
│  ├files/directories: db, lib, types, auth.ts, middleware.ts, etc.
│
Other meta files
```

## Single Responsibility and API Minimization

- Split files by responsibility, ensuring each file has a single responsibility
- Keep public APIs minimal and hide implementation details
- Minimize module boundaries and dependencies
- Separate client and server logic clearly (use "use client" directive when needed)

## Next.js Specific Guidelines

- Use Server Components by default, Client Components only when necessary
- Leverage built-in Next.js features: Image, Link, Font optimization
- Use proper data fetching patterns with async/await in Server Components
- Handle loading and error states with loading.tsx and error.tsx files
- Implement proper SEO with metadata API

## Basic Code Examples

### Server Component with Early Return

```tsx
// app/users/page.tsx
import { getUsers } from "@/lib/users";

export default async function UsersPage() {
  try {
    const users = await getUsers();
    
    if (!users.length) {
      return <div>No users found</div>;
    }
    
    return (
      <div>
        {users.map(user => (
          <div key={user.id}>{user.name}</div>
        ))}
      </div>
    );
  } catch (error) {
    throw new Error('Failed to load users');
  }
}
```

### API Route with Early Return

```ts
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUsers } from "@/lib/users";

export async function GET(request: NextRequest) {
  try {
    const users = await getUsers();
    
    if (!users) {
      return NextResponse.json({ error: "Users not found" }, { status: 404 });
    }
    
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### Business Logic with Standard Error Handling

```ts
// lib/users.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export async function getUsers(): Promise<User[]> {
  const response = await fetch('/api/external/users');
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export function validateUser(user: unknown): User {
  if (!user || typeof user !== 'object') {
    throw new Error('Invalid user data');
  }
  
  const { id, name, email } = user as Record<string, unknown>;
  
  if (typeof id !== 'string' || typeof name !== 'string' || typeof email !== 'string') {
    throw new Error('Missing required user fields');
  }
  
  return { id, name, email };
}
```

### Client Component with Early Return

```tsx
// components/user-list.tsx
"use client";

import { useState, useEffect } from "react";
import { type User } from "@/lib/types";

interface UserListProps {
  initialUsers: User[];
}

export function UserList({ initialUsers }: UserListProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  return (
    <div>
      <button onClick={refreshUsers} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh'}
      </button>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}