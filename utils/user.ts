import NextAuth, { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import { dbclient } from "@/db/db";
import { cache } from "react";
import { redirect } from "next/navigation";
import { NewUser, User, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      permissions?: string[] | null;
    };
  }
}

const authOptions: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      let dbUser: User[] = await dbclient
        .select()
        .from(users)
        .where(eq(users.email, user.email))
        .limit(1);

      if (dbUser.length === 0) {
        const newUserDate: NewUser = {
          email: user.email,
          name: user.name,
          image: user.image,
          permissions: [],
        };
        const newUser: User[] = await dbclient
          .insert(users)
          .values(newUserDate)
          .returning();

        if (!newUser) {
          console.error("Error creating user");
          return false;
        }

        dbUser = newUser;
      }

      return true;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

export const getUser = cache(async (): Promise<User | null> => {
  const session = await auth();

  if (!session?.user?.email) return null;

  const dbUser: User[] = await dbclient
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);

  if (!dbUser || dbUser.length === 0) {
    console.error("Sign in User Not Found");
    return null;
  }

  return dbUser[0];
});

export async function requireUser(): Promise<User> {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
