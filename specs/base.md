# About

This project Countent - Your AI accountent

# Stack

- NextJS
- PSQL

# Stack instructions:

- Do not read anything inside node_modules or .env file
- We are using shadcn UI, all components are downloaded inside app/components/ui
- If we create a table (users) the primary id should be called userid (not only id)
- If you are performing a task and there is "similar" files, like tables or paths, read a sample file to understand the syntax, logic as we want similar things to have same structure

# Some useful libs installed:

radix-ui
date-fns
drizzle
next
zod
clsx
lucide-react
tailwindcss
use-debounce
vaul

# Folder structures

- Default Nextjs structure
- DB logic inside /db/ and there is /db/tables, drizzle (read file if unsure of strucutre)
- use @ alias when importing. If file in the same path or below, we can use relative
- All files must always be lowercased
- A page can have the following structure (only if needed):

* user/page.tsx
* user/components/\*.tsx for components uses in user and subpages
* user/functions/actions.ts for all serverside functions, also for user and subpages
* user/functions/utils.ts for util functions, also for user and subpages

- /app/components and /utils are for files that is needed globaly e.g. not just user (meny, check userlogin etc).
- all hooks should always be inside /hooks

# Translation System

- NEVER edit files inside /content/ - user handles translations separately
- ALL user-facing text must use ttt() function with English keys
- Write all text in English, user has auto-translation script
- Add new translation keys to both content/en/index.ts and content/sv/index.ts when needed
- Import useLanguage hook: `import { useLanguage } from "@/hooks/uselanguage";`
- Usage pattern: `const { ttt } = useLanguage(); <Label>{ttt("Field Name")}</Label>`
- As we need to translate everything, try to homonize (Delete, remove, move to trash etc can be all Remove) and keep messages short.

# Database Patterns

- Primary keys: tablename + "id" (e.g., userid, companyid)
- Always export types: `export type TableName = typeof tablename.$inferSelect;`
- Always export insert types: `export type NewTableName = typeof tablename.$inferInsert;`
- Add exports to /db/schema.ts: `export * from "./tables/tablename";`
- Many-to-many relationships: create junction tables (e.g., companyUsers)
- Use proper foreign key constraints with onDelete: "cascade"
- All the objects and types are defined in the db/tables. Always check there and import then (for current and new object)

# Client/Server Separation - CRITICAL

- **NEVER import database utilities in client components** (causes TLS/Node.js import errors)
- Client components ("use client") can only use browser-compatible code
- Database queries must happen in:
  - Server components (no "use client")
  - Server actions ("use server")
  - API routes
- Pass data from server components to client components as props
- If client component needs database data, fetch it in parent server component and pass down
- Common error: importing getUserCompanies() in client sidebar - fetch in layout instead

# Server Actions Best Practices

- Always start with "use server"; directive
- Never put redirect() inside try-catch blocks (causes NEXT_REDIRECT errors)
- Return success/error objects from actions, handle redirects separately
- Validate required fields with proper error messages
- Use getUserCompanies utility for user-company relationships
- Pattern for server actions:

```typescript
"use server";
export async function actionName(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: "User not authenticated" };

    // validation and logic

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: "Error message" };
  }
}
```

# Dynamic Routes

- Directory names: [paramname] (no spaces!)
- Page components must accept and await params:

```typescript
interface PageProps {
  params: Promise<{ paramname: string }>;
}
export default async function Page({ params }: PageProps) {
  const { paramname } = await params;
}
```

# UI/UX Guidelines

- Mobile-first responsive design
- Use proper spacing: space-y-6 for sections, space-y-2 for fields
- Required vs optional field distinction
- Collapsible sections for non-essential information
- Loading states and proper error handling
- API errors are for logs, never forward them to frontend. Always use ttt in frontend
- Consistent shadcn/ui component usage

# Navigation & Routing

- User with no companies → /d/new
- User with companies → /d/[firstcompanyid]
- Use getUserCompanies() utility for company access checks
- Always validate user access to companies in layouts/pages

In summary:
We can login, check upload and log out

Do not:

- If you need to download i lib, ask me or give suggetions and i can download them seperatly and ask you to continue
- Do not run Drizzle migrations etc. i do the migrations manually
- NextJS params should always be awaited, e.g: ...UserPage({ params }: { params: Promise<{ userid: string }>;})const { userid } = await params;..
- NEVER edit content translation files - only suggest new keys needed
- Don't put redirect() in try-catch blocks
- Don't use hardcoded text - always use ttt() with English keys
- **NEVER import database functions in client components** - causes TLS errors
- Don't fetch data in client components - pass from server components as props
