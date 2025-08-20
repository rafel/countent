import { LoginForm } from "@/app/(auth)/components/login-form";
import { getUser } from "@/lib/db/queries/user";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getUser();
  if (user) {
    redirect("/d");
  }
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm />
      </div>
    </div>
  );
}
