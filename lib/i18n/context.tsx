'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { translations, type Locale, type TranslationKey } from './translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKey;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lazy-dao-locale', newLocale);
    }
  }, []);

  React.useEffect(() => {
    const saved = localStorage.getItem('lazy-dao-locale') as Locale | null;
    if (saved && translations[saved]) {
      setLocaleState(saved);
    }
  }, []);

  const t = translations[locale];

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}
