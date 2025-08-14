import Link from "next/link";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";

export function Footer() {
  return (
    <footer className="container-full min-h-[40rem px-4  pt-[calc(var(--navbar-height)+32px)] text-brand-white dark:text-brand-black md:px-6 lg:pt-[calc(var(--navbar-height)+48px)] mb-0 pb-0 ">
      <div className="relative flex flex-col justify-start mx-auto gap-4 pt-12 h-full max-w-[1808px] overflow-hidden rounded-t-2xl text-center md:justify-between md:gap-6 md:px-10 md:pt-24 mb-0 border-2 border-moon-100 px-8 py-8 dark:border-moon-800">
        <div className="mx-auto box-border max-w-[1672px] px-6 md:px-9">
          <div className="flex flex-col items-center justify-center gap-6 py-10">
            <div className="flex flex-col items-center justify-center gap-2">
              <Image
                src="/logo.svg"
                alt="Countent Logo"
                width={100}
                height={100}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
