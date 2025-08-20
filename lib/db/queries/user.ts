import { db } from "@/lib/db/db";
import {
  NewUser,
  User,
  users,
  userSessions,
  type UserSession,
  type NewUserSession,
} from "@/lib/db/tables/user";
import { and, eq, gt, lt } from "drizzle-orm";
import { generateHashedPassword } from "@/lib/db/utils";
import { ChatSDKError } from "@/lib/errors";
import { cache } from "react";
import { auth } from "@/app/(auth)/auth";

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(users).values({ email, password: hashedPassword });
  } catch {
    throw new ChatSDKError("bad_request:database", "Failed to create user");
  }
}

export async function createUserWithPassword(
  email: string,
  password: string,
  name?: string
): Promise<User | null> {
  try {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = generateHashedPassword(password);

    // Create new user
    const newUserData: NewUser = {
      email,
      name: name || null,
      password: hashedPassword,
      image: null,
      permissions: [],
    };

    const newUsers = await db.insert(users).values(newUserData).returning();

    return newUsers[0] || null;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const dbUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return dbUsers[0] || null;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
}

export async function createUserSession(
  userid: string,
  sessionToken: string,
  deviceInfo?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<UserSession | null> {
  try {
    // Calculate expiration (365 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 365);

    const sessionData: NewUserSession = {
      userid,
      sessiontoken: sessionToken,
      deviceinfo: deviceInfo || null,
      ipaddress: ipAddress || null,
      useragent: userAgent || null,
      expiresat: expiresAt,
    };

    const newSessions = await db
      .insert(userSessions)
      .values(sessionData)
      .returning();

    return newSessions[0] || null;
  } catch (error) {
    console.error("Error creating user session:", error);
    return null;
  }
}

export async function getActiveSession(
  sessionToken: string
): Promise<UserSession | null> {
  try {
    const session = await db
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.sessiontoken, sessionToken),
          gt(userSessions.expiresat, new Date())
        )
      )
      .limit(1);

    return session[0] || null;
  } catch (error) {
    console.error("Error getting active session:", error);
    return null;
  }
}

export async function updateSessionActivity(
  sessionToken: string
): Promise<boolean> {
  try {
    // First check if the session exists
    const existingSession = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.sessiontoken, sessionToken))
      .limit(1);

    if (existingSession.length === 0) {
      console.warn(
        "Session not found for activity update:",
        `${sessionToken.substring(0, 8)}...`
      );
      return false;
    }

    await db
      .update(userSessions)
      .set({ lastactive: new Date() })
      .where(eq(userSessions.sessiontoken, sessionToken));

    return true;
  } catch (error) {
    console.error("Error updating session activity:", error);
    return false;
  }
}

export async function invalidateSession(
  sessionToken: string
): Promise<boolean> {
  try {
    await db
      .delete(userSessions)
      .where(eq(userSessions.sessiontoken, sessionToken));

    return true;
  } catch (error) {
    console.error("Error invalidating session:", error);
    return false;
  }
}

export async function invalidateAllUserSessions(
  userid: string
): Promise<boolean> {
  try {
    await db.delete(userSessions).where(eq(userSessions.userid, userid));

    return true;
  } catch (error) {
    console.error("Error invalidating all user sessions:", error);
    return false;
  }
}

export async function getUserActiveSessions(
  userid: string
): Promise<UserSession[]> {
  try {
    const sessions = await db
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.userid, userid),
          gt(userSessions.expiresat, new Date())
        )
      )
      .orderBy(userSessions.lastactive);

    return sessions;
  } catch (error) {
    console.error("Error getting user active sessions:", error);
    return [];
  }
}

export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await db
      .delete(userSessions)
      .where(lt(userSessions.expiresat, new Date()));

    // Drizzle doesn't always return rowCount, so we'll return a success indicator
    return result ? 1 : 0;
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
    return 0;
  }
}

/**
 * Validates if a session token is active and not expired
 * @param sessionToken - The session token to validate
 * @returns true if session is valid and active, false otherwise
 */
export async function validateSessionToken(
  sessionToken: string
): Promise<boolean> {
  try {
    const session = await getActiveSession(sessionToken);
    return !!session;
  } catch (error) {
    console.error("Error validating session token:", error);
    return false;
  }
}

/**
 * Validates if a user has an active session
 * @param sessionToken - The session token to validate
 * @returns true if session is active, false otherwise
 */
export async function isUserSessionActive(
  sessionToken: string
): Promise<boolean> {
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
export async function getUserWithSession(): Promise<{
  user: User;
  sessionToken: string;
} | null> {
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
