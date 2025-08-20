import { RegisterForm } from "@/app/(auth)/components/register-form";
import { getUser } from "@/lib/db/queries/user";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const user = await getUser();
  if (user) {
    redirect("/d");
  }
  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <RegisterForm />
      </div>
    </div>
  );
}
