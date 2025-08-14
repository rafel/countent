import { LandingProviders } from "@/app/contexts/landingproviders";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LandingProviders>
      {children}
    </LandingProviders>
  );
}
