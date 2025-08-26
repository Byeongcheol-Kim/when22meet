'use client';

import { useState, useEffect } from 'react';
import koMessages from '@/messages/ko.json';
import enMessages from '@/messages/en.json';

export type Locale = 'ko' | 'en';

const messages = {
  ko: koMessages,
  en: enMessages,
} as const;

// Get nested translation from path
function getNestedTranslation(locale: Locale, path: string): string {
  const translations = messages[locale];
  const keys = path.split('.');
  let current: unknown = translations;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      // Fallback to Korean if translation not found
      const koTranslations = messages.ko;
      let koFallback: unknown = koTranslations;
      for (const k of keys) {
        if (koFallback && typeof koFallback === 'object' && k in koFallback) {
          koFallback = (koFallback as Record<string, unknown>)[k];
        } else {
          return path; // Return path if no fallback found
        }
      }
      return typeof koFallback === 'string' ? koFallback : path;
    }
  }
  
  return typeof current === 'string' ? current : path;
}

// Detect browser language
function detectBrowserLanguage(): Locale {
  if (typeof window === 'undefined') return 'ko';
  
  // Check navigator.language first
  const browserLang = navigator.language || (navigator as unknown as Record<string, string>).userLanguage;
  
  // Check if Korean
  if (browserLang && (browserLang.startsWith('ko') || browserLang.startsWith('kr'))) {
    return 'ko';
  }
  
  // Default to English for all other languages
  return 'en';
}

// Client-side translation hook with SSR support
export function useTranslation() {
  // Always start with 'ko' to prevent hydration mismatch
  const [locale, setLocaleState] = useState<Locale>('ko');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Only detect and set language after hydration
    const detectedLocale = detectBrowserLanguage();
    setLocaleState(detectedLocale);
    setIsHydrated(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const t = (path: string): string => {
    // Always use the current locale state
    // This ensures consistency between server and initial client render
    const translation = getNestedTranslation(locale, path);
    return translation;
  };

  return {
    locale,
    t,
    setLocale,
    isHydrated, // Components can use this to know when locale detection is complete
  };
}