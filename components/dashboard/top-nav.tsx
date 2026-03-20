"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, Bell, LogOut, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useLang } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { useAuth, type AuthRole } from "@/lib/auth";

export type ViewRole = "CTO" | "PM" | "Engineer";

const DEMO_SWITCH: { role: AuthRole; href: string; label: string }[] = [
  { role: "CTO",      href: "/cto",         label: "CTO — Nguyễn Văn Thành" },
  { role: "PM",       href: "/pm/PRJ-001",  label: "PM — Alice Morgan"       },
  { role: "Engineer", href: "/engineer",    label: "KS — James Hart"         },
];

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export function TopNav({
  role,
  breadcrumbs,
}: {
  role: ViewRole;
  setRole?: (r: ViewRole) => void; // kept for backward compat, unused
  breadcrumbs?: BreadcrumbItem[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { lang, setLang, t } = useLang();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-between gap-4 bg-card border-b border-border px-4 py-2.5 sticky top-0 z-30">
      {/* Left: Role badge + Breadcrumbs */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Static role badge */}
        <span className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-md px-3 py-1.5 text-xs font-semibold shrink-0">
          {role}
        </span>

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
                  <button onClick={crumb.onClick} className="hover:text-foreground transition-colors">
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

      {/* Right: Lang + Search + Bell + User */}
      <div className="flex items-center gap-3 shrink-0">
        {/* VI / EN toggle */}
        <div className="flex items-center rounded-md border border-border overflow-hidden text-xs font-semibold">
          <button
            onClick={() => setLang("vi")}
            className={`px-2.5 py-1.5 transition-colors ${lang === "vi" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
            aria-label="Switch to Vietnamese"
          >VI</button>
          <button
            onClick={() => setLang("en")}
            className={`px-2.5 py-1.5 transition-colors ${lang === "en" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
            aria-label="Switch to English"
          >EN</button>
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

        {/* User avatar dropdown */}
        {mounted && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="User menu"
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-[11px] font-bold shrink-0">
                  {user?.initials ?? role.slice(0, 2).toUpperCase()}
                </div>
                {user && (
                  <span className="hidden lg:block text-xs font-semibold text-foreground max-w-[120px] truncate">
                    {user.name}
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              {user && (
                <>
                  <DropdownMenuLabel className="text-xs">
                    <p className="font-bold text-foreground">{user.name}</p>
                    <p className="text-muted-foreground font-normal">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              {/* Demo role switcher */}
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Chuyển vai trò (demo)
              </DropdownMenuLabel>
              {DEMO_SWITCH.map(({ role: r, href, label }) => (
                <DropdownMenuItem
                  key={r}
                  onClick={() => router.push(href)}
                  className="cursor-pointer text-xs"
                >
                  {label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-xs text-destructive focus:text-destructive"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

