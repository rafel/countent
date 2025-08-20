import { getUser } from "@/lib/db/queries/user";
import { ThemeProvider } from "./themeprovider";
import { LanguageProvider } from "./languageprovider";
import type { Language } from "./languageprovider";

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
      <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>
    </LanguageProvider>
  );
}
