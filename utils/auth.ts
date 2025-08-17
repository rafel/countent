import { dbclient } from "@/db/db";
import {
  NewUser,
  User,
  users,
  userSessions,
  UserSession,
  NewUserSession,
} from "@/db/schema";
import { eq, lt, gt, and } from "drizzle-orm";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

export async function createUserWithPassword(
  email: string,
  password: string,
  name?: string
): Promise<User | null> {
  try {
    // Check if user already exists
    const existingUser = await dbclient
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUserData: NewUser = {
      email,
      name: name || null,
      password: hashedPassword,
      image: null,
      permissions: [],
    };

    const newUsers = await dbclient
      .insert(users)
      .values(newUserData)
      .returning();

    return newUsers[0] || null;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const dbUsers = await dbclient
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

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${buf.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(":");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(Buffer.from(hash, "hex"), buf);
}

// Session Management Functions

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
      session_token: sessionToken,
      device_info: deviceInfo || null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      expires_at: expiresAt,
    };

    const newSessions = await dbclient
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
    const session = await dbclient
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.session_token, sessionToken),
          gt(userSessions.expires_at, new Date())
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
    await dbclient
      .update(userSessions)
      .set({ last_active: new Date() })
      .where(eq(userSessions.session_token, sessionToken));

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
    await dbclient
      .delete(userSessions)
      .where(eq(userSessions.session_token, sessionToken));

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
    await dbclient.delete(userSessions).where(eq(userSessions.userid, userid));

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
    const sessions = await dbclient
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.userid, userid),
          gt(userSessions.expires_at, new Date())
        )
      )
      .orderBy(userSessions.last_active);

    return sessions;
  } catch (error) {
    console.error("Error getting user active sessions:", error);
    return [];
  }
}

export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await dbclient
      .delete(userSessions)
      .where(lt(userSessions.expires_at, new Date()));

    // Drizzle doesn't always return rowCount, so we'll return a success indicator
    return result ? 1 : 0;
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
    return 0;
  }
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}
