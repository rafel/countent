import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { cache } from "react";
import { NewUser, User, UserType, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import GoogleProvider from "next-auth/providers/google";
import {
  createUserSession,
  updateSessionActivity,
  generateSessionToken,
  getActiveSession,
} from "@/utils/auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      permissions?: string[] | null;
      type?: UserType;
    };
    sessionToken?: string;
  }

  interface JWT {
    sessionToken?: string;
    userid?: string;
    type?: UserType;
  }
}

// Note: Invite activation is now handled through the /d/invites page
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
          token.type = dbUser[0].type;
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
        const updated = await updateSessionActivity(token.sessionToken);
        if (!updated) {
          console.warn("Failed to update session activity, session may not exist in database");
        }
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
      if (typeof token.type === "string") {
        session.user.type = token.type as UserType;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

/**
 * Validates if a user has an active session
 * @param sessionToken - The session token to validate
 * @returns true if session is active, false otherwise
 */
export async function isUserSessionActive(sessionToken: string): Promise<boolean> {
  try {
    const activeSession = await getActiveSession(sessionToken);
    return !!activeSession;
  } catch (error) {
    console.error("Error checking session activity:", error);
    return false;
  }
}

/**
 * Gets the authenticated user if they have a valid session
 * Returns null if user is not authenticated or session is invalid/expired
 */
export const getUser = cache(async (): Promise<User | null> => {
  const session = await auth();

  if (!session?.user?.email) return null;

  // Check if session has a session token and if it's valid in the database
  if (session.sessionToken) {
    const activeSession = await getActiveSession(session.sessionToken);
    if (!activeSession) {
      // Session token exists in JWT but not in database or expired
      console.warn("Invalid or expired session token");
      return null;
    }
  }

  const dbUser: User[] = await db
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

/**
 * Gets the authenticated user along with session information
 * Returns null if user is not authenticated or session is invalid/expired
 */
export async function getUserWithSession(): Promise<{ user: User; sessionToken: string } | null> {
  const session = await auth();

  if (!session?.user?.email || !session.sessionToken) return null;

  // Validate session token
  const activeSession = await getActiveSession(session.sessionToken);
  if (!activeSession) {
    console.warn("Invalid or expired session token");
    return null;
  }

  const dbUser: User[] = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);

  if (!dbUser || dbUser.length === 0) {
    console.error("Sign in User Not Found");
    return null;
  }

  return {
    user: dbUser[0],
    sessionToken: session.sessionToken,
  };
}
