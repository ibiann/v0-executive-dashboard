"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Network, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS = [
  {
    role: "CTO",
    href: "/cto",
    label: "CTO / Executive",
    description: "Portfolio insights, resource planning, risk management",
    color: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  {
    role: "PM",
    href: "/pm/PRJ-001",
    label: "Project Manager",
    description: "Phase planning, task kanban, timesheet approval",
    color: "bg-blue-600 text-white hover:bg-blue-700",
  },
  {
    role: "Engineer",
    href: "/engineer",
    label: "Engineer",
    description: "My tasks, time logging, progress tracking",
    color: "bg-green-600 text-white hover:bg-green-700",
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [error,    setError]    = useState("");

  function handleLogin(href: string) {
    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }
    setError("");
    router.push(href);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo + title */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sidebar shadow-sm">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground tracking-tight">Lancsnetworks</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Strategic Executive Dashboard</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-5">

          {/* Fields */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder="e.g. alice.morgan"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full border border-border rounded-lg px-3 py-2 pr-9 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-destructive font-medium">{error}</p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Sign in as</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Role buttons */}
          <div className="space-y-2">
            {ROLE_OPTIONS.map(({ role, href, label, description, color }) => (
              <button
                key={role}
                onClick={() => handleLogin(href)}
                className={cn(
                  "w-full text-left rounded-lg px-4 py-3 transition-colors",
                  color
                )}
              >
                <p className="text-sm font-bold leading-tight">{label}</p>
                <p className="text-[11px] opacity-80 mt-0.5">{description}</p>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground">
          Portfolio Management System v2.1 — Lancsnetworks
        </p>
      </div>
    </div>
  );
}
