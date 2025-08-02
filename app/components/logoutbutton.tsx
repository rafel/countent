"use client";

import { Button } from "@radix-ui/themes";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return <Button onClick={() => signOut()}>Logout</Button>;
}
