 import { getUser } from "@/utils/user";
import { ThemeProvider } from "./themeprovider";
import { LanguageProvider } from "./languageprovider";
import { Language } from "./languageprovider";

interface DashboardProvidersProps {
  children: React.ReactNode;
}

export async function DashboardProviders({ children }: DashboardProvidersProps) {
  // Fetch user data server-side for initial theme/language only
  const user = await getUser();
  
  // Extract user preferences or use defaults
  const initialTheme = user?.theme || "system";
  const initialLanguage = (user?.language as Language) || "en";

  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <ThemeProvider initialTheme={initialTheme}>
        {children}
      </ThemeProvider>
    </LanguageProvider>
  );
} 
