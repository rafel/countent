import { dbclient } from "@/db/db";
import { NewUser, User, users } from "@/db/schema";
import { eq } from "drizzle-orm";
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
