import { NextRequest, NextResponse } from "next/server";
import { dbclient } from "@/db/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/utils/password";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      // Return 200 with null for missing credentials to avoid error logs
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Find user by email
    const dbUser = await dbclient
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (dbUser.length === 0 || !dbUser[0].password) {
      // Return 200 with null to indicate failed authentication without causing errors
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Verify password
    const isValid = await verifyPassword(password, dbUser[0].password);

    if (!isValid) {
      // Return 200 with null to indicate failed authentication without causing errors
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Return user data (without password)
    return NextResponse.json({
      user: {
        id: dbUser[0].userid,
        email: dbUser[0].email,
        name: dbUser[0].name,
        image: dbUser[0].image,
      },
    });
  } catch (error) {
    console.error("Credentials authentication error:", error);
    // Return 200 with null for any server errors to avoid NextAuth error logs
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
