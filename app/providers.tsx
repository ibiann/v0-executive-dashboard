"use client";

import { LangProvider } from "@/lib/i18n";
import { AppStateProvider } from "@/lib/app-state";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <AppStateProvider>
        {children}
      </AppStateProvider>
    </LangProvider>
  );
}
