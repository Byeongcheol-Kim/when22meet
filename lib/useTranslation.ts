'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import koMessages from '@/messages/ko.json';
import enMessages from '@/messages/en.json';
import zhMessages from '@/messages/zh.json';
import jaMessages from '@/messages/ja.json';

export type Locale = 'ko' | 'en' | 'zh' | 'ja';

const STORAGE_KEY = 'when2meet-locale';

const messages = {
  ko: koMessages,
  en: enMessages,
  zh: zhMessages,
  ja: jaMessages,
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

  if (!browserLang) return 'en';

  // Check if Korean
  if (browserLang.startsWith('ko') || browserLang.startsWith('kr')) {
    return 'ko';
  }

  // Check if Chinese (zh, zh-CN, zh-TW, zh-HK, etc.)
  if (browserLang.startsWith('zh')) {
    return 'zh';
  }

  // Check if Japanese
  if (browserLang.startsWith('ja')) {
    return 'ja';
  }

  // Default to English for all other languages
  return 'en';
}

// Global locale store for sharing state across components
let globalLocale: Locale = 'ko';
const listeners: Set<() => void> = new Set();

function getSnapshot(): Locale {
  return globalLocale;
}

function getServerSnapshot(): Locale {
  return 'ko';
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setGlobalLocale(newLocale: Locale) {
  globalLocale = newLocale;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, newLocale);
  }
  listeners.forEach(listener => listener());
}

// Initialize from localStorage or browser detection
function initializeLocale() {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && ['ko', 'en', 'zh', 'ja'].includes(stored)) {
    globalLocale = stored;
  } else {
    globalLocale = detectBrowserLanguage();
  }
  listeners.forEach(listener => listener());
}

// Client-side translation hook with SSR support
export function useTranslation() {
  const [isHydrated, setIsHydrated] = useState(false);

  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    initializeLocale();
    setIsHydrated(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setGlobalLocale(newLocale);
  }, []);

  const t = useCallback((path: string): string => {
    return getNestedTranslation(locale, path);
  }, [locale]);

  return {
    locale,
    t,
    setLocale,
    isHydrated,
  };
}
