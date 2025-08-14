"use client";

import * as React from "react";
import { Theme } from "@radix-ui/themes";

interface LandingProvidersProps {
  children: React.ReactNode;
}

export function LandingProviders({ children }: LandingProvidersProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Force dark theme on document element
    document.documentElement.classList.add("dark");

    // Cleanup when unmounting (when leaving landing pages)
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  if (!mounted) {
    // Return with dark theme applied immediately to prevent flash
    return (
      <Theme accentColor="gray" radius="large" appearance="dark">
        {children}
      </Theme>
    );
  }

  return (
    <Theme accentColor="gray" radius="large" appearance="dark">
      {children}
    </Theme>
  );
}
