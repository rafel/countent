# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Countent - Your AI Accountant** built with Next.js 15, PostgreSQL, and modern TypeScript stack.

## Development Commands

```bash
npm run lint            # Run ESLint
```

## Critical Architecture Rules

### File Structure and Naming
- **ALL files must be lowercase** - no exceptions
- Use `@` alias for imports from project root
- Relative imports only for files in same directory or below

### Database Patterns
- Primary keys follow `tablename + "id"` pattern (e.g., `userid`, `companyid`)
- All table definitions in `/db/tables/` with required type exports:
  ```typescript
  export type TableName = typeof tablename.$inferSelect;
  export type NewTableName = typeof tablename.$inferInsert;
  ```
- Add exports to `/db/schema.ts`: `export * from "./tables/tablename";`
- Import types from database tables: `import { Company } from "@/db/tables/company";`

### Client/Server Separation - CRITICAL
- **NEVER import database utilities in client components** (causes TLS/Node.js errors)
- Database queries only allowed in:
  - Server components (no "use client")
  - Server actions ("use server") 
  - API routes (`/app/api/`)
- Pass data from server components to client components as props
- Common error: importing `getUserCompanies()` in client components

### Server Actions Pattern
Required pattern for all server actions:
```typescript
"use server";

export async function actionName(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "User not authenticated" };
    
    // validation and logic here
    
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Error message" };
  }
}
```

**CRITICAL**: Never put `redirect()` inside try-catch blocks (causes NEXT_REDIRECT errors)

### Dynamic Routes (Next.js App Router)
- Directory naming: `[paramname]` (no spaces)
- Always await params in components:
  ```typescript
  interface PageProps {
    params: Promise<{ paramname: string }>;
  }
  
  export default async function Page({ params }: PageProps) {
    const { paramname } = await params;
    // Always validate user access to the resource
  }
  ```

### Navigation Logic
- User with no companies → `/dashboard/new`
- User with companies → `/dashboard/[firstcompanyid]`
- Always use `getUserCompanies()` utility for company access checks
- Validate user access to companies in all layouts/pages

## Translation System

**ALL user-facing text must use `ttt()` function with English keys**

```typescript
"use client";
import { useLanguage } from "@/hooks/uselanguage";

export function Component() {
  const { ttt } = useLanguage();
  
  return (
    <div>
      <Label>{ttt("Field Name")}</Label>
      <Button>{ttt("Save Changes")}</Button>
      <p>{ttt("Error message text")}</p>
    </div>
  );
}
```

- **NEVER edit files inside `/content/`** - user handles translations
- Write all translation keys in English
- Keep messages short and consistent
- API errors are for logs only - never forward to frontend, always use `ttt()` for user-facing errors

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: shadcn/ui, Radix UI, Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with custom session management
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Project Structure

```
app/
├── (dashboard)/          # Dashboard layout group
│   ├── dashboard/        # Main dashboard pages
│   └── components/       # Dashboard-specific components
├── (landing)/           # Landing page layout group
├── api/                 # API routes
└── components/          # Global components
    └── ui/             # shadcn/ui components

db/
├── tables/             # Database table definitions
├── migrations/         # Drizzle migrations
└── schema.ts          # Export all tables

utils/                  # Server-side utilities
hooks/                  # All React hooks
content/               # Translation files (DO NOT EDIT)
```

## Common Utilities

- `getUser()` - Get authenticated user
- `getUserCompanies(userId)` - Get user's companies with roles
- `getUserWithSession()` - Get user with session validation
- Session management functions in `/utils/auth.ts`
- Company utilities in `/utils/company.ts`

## Development Restrictions

**DO NOT**:
- Install packages without user approval
- Run database migrations (user handles manually)
- Edit `/content/` translation files
- Put `redirect()` inside try-catch blocks
- Import database functions in client components
- Use hardcoded text (always use `ttt()`)
- Create uppercase filenames
- Forward API errors to frontend

## Testing and Quality

- Run `npm run lint` after significant changes
- Validate user access to resources in all routes
- Implement proper loading and error states
- Use mobile-first responsive design patterns
