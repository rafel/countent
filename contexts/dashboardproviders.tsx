import { getUser } from "@/lib/user";
import { ThemeProvider } from "@/contexts/themeprovider";
import { LanguageProvider } from "@/contexts/languageprovider";
import { Language } from "@/contexts/languageprovider";
import { DataStreamProvider } from '@/components/data-stream-provider';

interface DashboardProvidersProps {
  children: React.ReactNode;
}

export async function DashboardProviders({
  children,
}: DashboardProvidersProps) {
  // Fetch user data server-side for initial theme/language only
  const user = await getUser();

  // Extract user preferences or use defaults
  const initialTheme = user?.theme || "system";
  // Only pass initialLanguage if user is logged in, otherwise let localStorage take precedence
  const initialLanguage = user?.language as Language;

  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <ThemeProvider initialTheme={initialTheme}>
        <DataStreamProvider>{children}</DataStreamProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
