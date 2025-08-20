import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUserWithPassword } from "@/lib/db/queries/user";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await getUserByEmail(validatedData.email);
    if (existingUser) {
      return NextResponse.json(
        { error: "user_exists", message: "User already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = await createUserWithPassword(
      validatedData.email,
      validatedData.password,
      validatedData.name
    );

    if (!newUser) {
      return NextResponse.json(
        { error: "creation_failed", message: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: {
          id: newUser.userid,
          email: newUser.email,
          name: newUser.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "validation_error",
          message: "Invalid input data",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "internal_error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
