import { SharedProviders } from "@/contexts/sharedproviders";

interface InvitesLayoutProps {
  children: React.ReactNode;
}

export default function InvitesLayout({ children }: InvitesLayoutProps) {
  return (
    <SharedProviders>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </SharedProviders>
  );
} 
