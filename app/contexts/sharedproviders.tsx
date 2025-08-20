import { getUser } from "@/lib/db/queries/user";
import { LanguageProvider } from "./languageprovider";
import type { Language } from "./languageprovider";

interface SharedProvidersProps {
  children: React.ReactNode;
}

export async function SharedProviders({
  children,
}: SharedProvidersProps) {
  // Fetch user data server-side for initial theme/language only
  const user = await getUser();

  // Only pass initialLanguage if user is logged in, otherwise let localStorage take precedence
  const initialLanguage = user?.language as Language;

  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      {children}
    </LanguageProvider>
  );
}
