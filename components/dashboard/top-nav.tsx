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

const ROLE_BADGE: Record<ViewRole, { label: string; className: string }> = {
  CTO:      { label: "CTO",   className: "bg-blue-100 text-blue-700 border border-blue-200"    },
  PM:       { label: "PM",    className: "bg-green-100 text-green-700 border border-green-200" },
  Engineer: { label: "Ky su", className: "bg-amber-100 text-amber-700 border border-amber-200" },
};

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
        {/* Role badge — color-coded by role */}
        <span className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold shrink-0 ${ROLE_BADGE[role].className}`}>
          {ROLE_BADGE[role].label}
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
        {/* VI / EN toggle — hidden */}
        {/* 
        <div className="flex items-center rounded-md border border-border overflow-hidden text-xs font-semibold">
          <button ...>VI</button>
          <button ...>EN</button>
        </div>
        */}

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

