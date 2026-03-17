"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, Bell, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useLang } from "@/lib/i18n";

export type ViewRole = "CTO" | "PM" | "Engineer";

const ROLES: ViewRole[] = ["CTO", "PM", "Engineer"];

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export function TopNav({
  role,
  setRole,
  breadcrumbs,
}: {
  role: ViewRole;
  setRole: (r: ViewRole) => void;
  breadcrumbs?: BreadcrumbItem[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { lang, setLang, t } = useLang();

  return (
    <header className="flex items-center justify-between gap-4 bg-card border-b border-border px-4 py-2.5 sticky top-0 z-30">
      {/* Left: View As + Breadcrumbs */}
      <div className="flex items-center gap-4 min-w-0">
        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-md px-3 py-1.5 text-xs font-semibold hover:bg-primary/20 transition-colors shrink-0">
                <span>{t("viewAs")}: {role}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-36">
              {ROLES.map((r) => (
                <DropdownMenuItem
                  key={r}
                  onClick={() => setRole(r)}
                  className="cursor-pointer"
                >
                  {r}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-md px-3 py-1.5 text-xs font-semibold shrink-0">
            <span>{t("viewAs")}: {role}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Breadcrumbs */}
        <nav
          className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground"
          aria-label="Breadcrumb"
        >
          {breadcrumbs && breadcrumbs.length > 0 ? (
            breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                {crumb.onClick ? (
                  <button
                    onClick={crumb.onClick}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                )}
              </span>
            ))
          ) : (
            <>
              <span className="hover:text-foreground cursor-pointer transition-colors">Dashboard</span>
              <span>/</span>
              <span className="text-foreground font-medium">{t("portfolio")}</span>
            </>
          )}
        </nav>
      </div>

      {/* Right: Language Switcher + Search + Icons */}
      <div className="flex items-center gap-3 shrink-0">
        {/* VI / EN toggle */}
        <div className="flex items-center rounded-md border border-border overflow-hidden text-xs font-semibold">
          <button
            onClick={() => setLang("vi")}
            className={`px-2.5 py-1.5 transition-colors ${
              lang === "vi"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted"
            }`}
            aria-label="Switch to Vietnamese"
          >
            VI
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-2.5 py-1.5 transition-colors ${
              lang === "en"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted"
            }`}
            aria-label="Switch to English"
          >
            EN
          </button>
        </div>

        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder={t("search")}
            className="pl-8 pr-3 py-1.5 text-xs rounded-md border border-border bg-secondary focus:outline-none focus:ring-2 focus:ring-ring w-56"
          />
        </div>
        <button
          className="relative p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label={t("notifications")}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-destructive" />
        </button>
        <button
          className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
          aria-label="User profile"
        >
          <User className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
