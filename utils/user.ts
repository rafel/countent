import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { dbclient } from "@/db/db";
import { cache } from "react";
import { NewUser, User, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import GoogleProvider from "next-auth/providers/google";
import {
  createUserSession,
  updateSessionActivity,
  generateSessionToken,
} from "@/utils/auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      permissions?: string[] | null;
    };
    sessionToken?: string;
  }

  interface JWT {
    sessionToken?: string;
    userid?: string;
  }
}

// Note: Invite activation is now handled through the /dashboard/invites page
// This allows users to review and accept/decline invitations manually

const authOptions: NextAuthConfig = {
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
      async authorize(credentials, req) {
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
  // The Credentials provider can only be used if JSON Web Tokens are enabled for sessions
  session: {
    strategy: "jwt",
  },
  // Configure logger to suppress CredentialsSignin errors (they're expected behavior)
  logger: {
    error(error: Error) {
      // Don't log CredentialsSignin errors - they're expected when users enter wrong passwords
      if (error.name === "CredentialsSignin") {
        return;
      }
      // Log all other errors normally
      console.error(`[auth][error] ${error.name}:`, error.message);
    },
  },
  callbacks: {
    async signIn({ user, account }) {
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

    async jwt({ token, user, account }) {
      // If this is a new sign-in, create a session
      if (account && user?.email) {
        const dbUser = await dbclient
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1);

        if (dbUser.length > 0) {
          token.userid = dbUser[0].userid;

          // Generate and store session token
          const sessionToken = generateSessionToken();
          token.sessionToken = sessionToken;

          // Create session in database
          await createUserSession(
            dbUser[0].userid,
            sessionToken,
            "Web Browser", // Device info - could be enhanced with actual device detection
            undefined, // IP address - would need request context
            undefined // User agent - would need request context
          );
        }
      }

      // Update session activity if session exists
      if (typeof token.sessionToken === "string") {
        await updateSessionActivity(token.sessionToken);
      }

      return token;
    },

    async session({ session, token }) {
      if (typeof token.userid === "string") {
        session.user.id = token.userid;
      }
      if (typeof token.sessionToken === "string") {
        session.sessionToken = token.sessionToken;
      }
      return session;
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
