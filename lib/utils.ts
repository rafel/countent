import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { genSaltSync, hashSync } from "bcrypt-ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function generateHashedPassword(password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return hash;
}
export function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}
