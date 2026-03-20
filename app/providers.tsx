"use client";

import { LangProvider } from "@/lib/i18n";
import { AppStateProvider } from "@/lib/app-state";
import { AuthProvider } from "@/lib/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LangProvider>
        <AppStateProvider>
          {children}
        </AppStateProvider>
      </LangProvider>
    </AuthProvider>
  );
}
