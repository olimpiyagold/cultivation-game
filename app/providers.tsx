'use client';

import { ThemeProvider } from 'next-themes';
import { I18nProvider } from '@/lib/i18n/context';
import { GameProvider } from '@/lib/game/context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <I18nProvider>
        <GameProvider>
          {children}
        </GameProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
