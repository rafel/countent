 import { getUser } from "@/utils/user";
import { ThemeProvider } from "./themeprovider";
import { LanguageProvider } from "./languageprovider";
import { Language } from "./languageprovider";

interface ServerProvidersProps {
  children: React.ReactNode;
}

export async function ServerProviders({ children }: ServerProvidersProps) {
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
