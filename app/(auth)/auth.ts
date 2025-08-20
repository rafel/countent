import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import type { DefaultJWT } from "next-auth/jwt";
import { db } from "@/lib/db/db";
import { User, users, type UserType } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NewUser } from "@/lib/db/schema";
import { generateSessionToken } from "@/lib/db/utils";
import {
  createUserSession,
  updateSessionActivity,
} from "@/lib/db/queries/user";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      userid: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      permissions?: string[] | null;
      type: UserType;
    };
    sessionToken?: string;
    expires: string;
  }

  interface JWT extends DefaultJWT {
    sessionToken?: string;
    userid?: string;
    sessionid?: string;
    type: UserType;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "m@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Call our API endpoint to verify credentials
          // This avoids using Node.js crypto module in the Edge runtime
          const res = await fetch(
            `${
              process.env.NEXTAUTH_URL || "http://localhost:3000"
            }/api/auth/credentials`,
            {
              method: "POST",
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
              headers: { "Content-Type": "application/json" },
            }
          );

          const response = await res.json();

          // If no error and we have user data, return it
          if (res.ok && response.user) {
            return response.user;
          }

          // Return null if user data could not be retrieved
          return null;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      let dbUser: User[] = await db
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
        const newUser: User[] = await db
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

    async jwt({ token, user, account }) {
      // If this is a new sign-in, create a session
      if (account && user?.email) {
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1);

        if (dbUser.length > 0) {
          token.userid = dbUser[0].userid;
          token.type = dbUser[0].type as UserType;

          // Generate and store session token
          const sessionToken = generateSessionToken();
          token.sessionToken = sessionToken;

          // Create session in database
          const session = await createUserSession(
            dbUser[0].userid,
            sessionToken,
            "Web Browser", // Device info - could be enhanced with actual device detection
            undefined, // IP address - would need request context
            undefined // User agent - would need request context
          );
          token.sessionid = session?.sessionid;
        }
      }

      // Update session activity if session exists
      if (typeof token.sessionToken === "string") {
        const updated = await updateSessionActivity(token.sessionToken);
        if (!updated) {
          console.warn(
            "Failed to update session activity, session may not exist in database"
          );
        }
      }

      // Ensure type is set for existing tokens
      if (token.userid && !token.type) {
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.userid, token.userid as string))
          .limit(1);
        
        if (dbUser.length > 0) {
          token.type = dbUser[0].type as UserType;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (typeof token.userid === "string") {
        session.user.userid = token.userid;
      }
      if (typeof token.sessionToken === "string") {
        session.sessionToken = token.sessionToken;
      }
      if (token.type) {
        session.user.type = token.type as UserType;
      }
      return session;
    },
  },
});
