import Link from "next/link";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";

export function Navigation() {
  return (
    <nav className="fixed top-4 z-[9999] w-full lg:top-6">
      <div className="mx-auto box-border max-w-[1672px] px-6 md:px-9">
        <div className="relative flex h-[var(--navbar-height)] w-full items-center justify-between rounded-lg border border-transparent bg-background px-2 py-1.5 transition-[box-shadow_background-color_border-color] duration-300 motion-reduce:transition-none lg:grid lg:grid-cols-[1fr_auto_1fr] lg:rounded-2xl lg:py-[0.4375rem] lg:pr-[0.4375rem]">
          <Link
            aria-label="Homepage"
            className="relative flex w-fit items-center gap-0.5 overflow-hidden lg:px-3 "
            href="/"
          >
            <div className="bg-white rounded-lg p-1">
              <Image
                alt=""
                width={32}
                height={32}
                decoding="async"
                src="/logo.svg"
              />
            </div>
          </Link>
          <ul className="col-start-2 gap-5 px-2 font-medium text-muted-foreground xl:gap-6 hidden lg:flex">
            <li>
              <Link href="/pricing">Pricing</Link>
            </li>
            <li>
              <Link href="/features">Features</Link>
            </li>
            <li>
              <Link href="/enterprise">Enterprise</Link>
            </li>
            <li>
              <Link href="/blog">Blog</Link>
            </li>
          </ul>

          <div className="col-start-3 hidden w-full justify-end gap-2 lg:flex">
            <Button asChild variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild variant="default" className="bg-primary text-primary-foreground">
              <Link href="/login">Download</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
