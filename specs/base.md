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
* user/components/*.tsx for components uses in user and subpages 
* user/functions/actions.ts for all serverside functions, also for user and subpages
* user/functions/utils.ts for util functions, also for user and subpages
- /components and /utils are for files that is needed globaly e.g. not just user (meny, check userlogin etc).
- all hooks should always be inside /hooks


In summary:
We can login, check upload and log out

Do not:
- If you need to download i lib, ask me or give suggetions and i can download them seperatly and ask you to continue
- Do not run Drizzle migrations etc. i do the migrations manually
- NextJS params should always be awaited, e.g: ...UserPage({ params }: { params: Promise<{ userid: string }>;})const { userid } = await params;..
