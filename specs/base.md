# About
This project Countent - Your AI accountent

# Stack
- NextJS
- PSQL

# Stack instructions:
- Do not read anything inside node_modules
- Use Radix UI default theme and ui, avoid wrapper components unless needed
- There is .env file, dont read it
- If we create a table (users) the primary id should be called userid (not only id)

# Libs:
@radix-ui/react-icons
@radix-ui/themes
@supabase/supabase-js
date-fns
drizzle-kit
drizzle-orm
drizzle-zod
next
radix-ui
react
react-dom
zod

# Folder structures
- Default Nextjs structure
- /db should have all psql sql codes (use drizzle, have a ts file and a sql file)
- use @ alias when importing (check tsconfig.json). If file in the same path or below, we can use relative
- All files must always be lowercased

In summary:
We can login, check upload and log out

Do not:
- Don't get stuck if you run npm run dev (as it build nextjs and waits). If you run it and want me to do something tell me it. But make sure you dont get stuck and i need to escape and exit you
- Do not run Drizzle migrations etc. i do the migrations manually. update/create sql file.
- dont forget to use awaited params, example on error i get Error: Route "/dashboard/users/[userid]/edit" used `params.userid`. `params` should be awaited before using its properties.
    at EditUserPage (app/dashboard/users/[userid]/edit/page.tsx:8:36)
   6 |
   7 | export default async function EditUserPage({ params }: { params: { userid: string } }) {
>  8 |   const user = await getUser(params.userid);
