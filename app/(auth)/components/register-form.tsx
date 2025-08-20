"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { AlertCircleIcon } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { commonSettings } from "@/content/common";
import Image from "next/image";
import { useTheme } from "next-themes";
import Link from "next/link";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { ttt } = useLanguage();
  const { resolvedTheme } = useTheme();

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setError(""); // Clear any previous errors
    try {
      await signIn("google", { redirectTo: "/d" });
    } catch {
      setError(ttt("Something went wrong"));
      setIsLoading(false);
    }
  };

  const handlePasswordRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear any previous errors

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(ttt("Passwords do not match"));
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError(ttt("Password must be at least 6 characters long"));
      setIsLoading(false);
      return;
    }

    try {
      // First, try to register with credentials
      const result = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const response = await result.json();

      if (!result.ok) {
        if (response.error === "user_exists") {
          setError(ttt("An account with this email already exists"));
        } else {
          setError(ttt("Failed to create account. Please try again."));
        }
        setIsLoading(false);
        return;
      }

      // If registration successful, sign in
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirectTo: "/d",
        redirect: false,
      });

      if (signInResult?.error) {
        setError(
          ttt("Account created but failed to sign in. Please try logging in.")
        );
      } else if (signInResult?.ok) {
        // Successful registration and login
        window.location.href = "/d";
      } else {
        setError(
          ttt("Network error. Please check your connection and try again.")
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(ttt("Something went wrong"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <a href="#" className="flex items-center gap-2 self-center font-medium">
        <div className="flex size-6 items-center justify-center rounded-md">
          <Image
            src={
              resolvedTheme === "dark"
                ? commonSettings.LogoDark
                : commonSettings.Logo
            }
            alt={ttt("ServiceName")}
            width={24}
            height={24}
          />
        </div>
        {ttt("ServiceName")}
      </a>

      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {ttt("Create your account")}
            </CardTitle>
            <CardDescription>
              {ttt("Sign up with your Google account or email and password")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircleIcon />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Google Register Button */}
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleRegister}
                  disabled={isLoading}
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {ttt("Sign up with Google")}
                </Button>
              </div>

              {/* Separator */}
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  {ttt("Or continue with")}
                </span>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handlePasswordRegister}>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">{ttt("Full Name")}</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={ttt("John Doe")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="email">{ttt("Email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="password">{ttt("Password")}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="confirmPassword">
                      {ttt("Confirm Password")}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading
                      ? ttt("Creating account...")
                      : ttt("Create Account")}
                  </Button>
                </div>
              </form>

              <div className="text-center text-sm">
                {ttt("Already have an account?")}{" "}
                <Button
                  variant="link"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  <Link href="/login">{ttt("Sign in")}</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          {ttt("By clicking continue, you agree to our")}{" "}
          <a href="#">{ttt("Terms of Service")}</a> {ttt("and")}{" "}
          <a href="#">{ttt("Privacy Policy")}</a>.
        </div>
      </div>
    </>
  );
}
