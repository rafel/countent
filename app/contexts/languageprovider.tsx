"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import enTranslations from "@/content/en/index";
import svTranslations from "@/content/sv/index";

// Define available languages
export const LANGUAGES = [
  { id: "en", title: "English" },
  { id: "sv", title: "Svenska" },
] as const;

// Define language type
export type Language = "en" | "sv";

// Define the shape of our translation objects
type TranslationDictionary = {
  [key: string]: string;
};

// Create translation dictionaries
export const translations: Record<Language, TranslationDictionary> = {
  en: enTranslations,
  sv: svTranslations,
};

// Create a type for all available translation keys
export type TranslationKey = keyof typeof enTranslations;

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  isLoaded: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const { data: session } = useSession();
  const [language, setLanguageState] = useState<Language>(initialLanguage || "en");
  const [isLoaded, setIsLoaded] = useState(!!initialLanguage);

  // Load saved language preference from database when user session is available
  // Only if we don't have an initial language value
  useEffect(() => {
    let isMounted = true;

    const loadLanguage = async () => {
      try {
        // Only fetch from database if we don't have an initial language
        if (session?.user && !initialLanguage) {
          const response = await fetch('/api/user/preferences', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (response.ok) {
            const userData = await response.json();
            if (isMounted && userData.language && 
                (userData.language === "en" || userData.language === "sv")) {
              setLanguageState(userData.language);
            }
          }
        }
        
        if (isMounted) {
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Failed to load language preference:", error);
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    if (session !== undefined) { // Wait for session to be determined
      loadLanguage();
    }

    return () => {
      isMounted = false;
    };
  }, [session, initialLanguage]);

  // Set language and save to database
  const setLanguage = useCallback(
    async (lang: Language) => {
      try {
        // Update state immediately
        setLanguageState(lang);

        // Save to database if user is logged in
        if (session?.user) {
          await fetch("/api/user/preferences", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language: lang }),
          });
        }
      } catch (error) {
        console.error("Failed to save language preference:", error);
      }
    },
    [session]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Internal hook for accessing the context
export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error(
      "useLanguageContext must be used within a LanguageProvider"
    );
  }
  return context;
}
