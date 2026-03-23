"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthRole = "Chairman" | "CTO" | "PM" | "Engineer";

export interface AuthUser {
  email: string;
  name: string;
  role: AuthRole;
  initials: string;
  redirect: string;
  /** Project IDs this user is assigned to (PMs: managed projects, Engineers: projects with their tasks) */
  projectIds: string[];
  /** Engineer name as it appears in task assigneeName field */
  engineerName?: string;
}

// ─── Demo accounts ────────────────────────────────────────────────────────────

const DEMO_ACCOUNTS: (AuthUser & { password: string })[] = [
  { email: "chairman@lancs.vn",  password: "123456", name: "Đỗ Mạnh Hùng",     role: "Chairman", initials: "DH", redirect: "/cto",        projectIds: []                                         },
  { email: "cto@lancs.vn",       password: "123456", name: "Nguyễn Văn Thành", role: "CTO",      initials: "NT", redirect: "/cto",         projectIds: []                                         },
  { email: "pm.alice@lancs.vn",  password: "123456", name: "Alice Morgan",     role: "PM",       initials: "AM", redirect: "/pm/PRJ-001",  projectIds: ["PRJ-001", "PRJ-003"]                     },
  { email: "pm.bob@lancs.vn",    password: "123456", name: "Bob Chen",         role: "PM",       initials: "BC", redirect: "/pm/PRJ-002",  projectIds: ["PRJ-002", "PRJ-004"]                     },
  { email: "james@lancs.vn",     password: "123456", name: "James Hart",       role: "Engineer", initials: "JH", redirect: "/engineer",    projectIds: ["PRJ-001", "PRJ-002"], engineerName: "James Hart"  },
  { email: "priya@lancs.vn",     password: "123456", name: "Priya Nair",       role: "Engineer", initials: "PN", redirect: "/engineer",    projectIds: ["PRJ-001", "PRJ-003"], engineerName: "Priya Nair"  },
];

const STORAGE_KEY = "lancs_auth_user";

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Return safe no-op default during SSR / before provider mounts
    return {
      user:    null,
      login:   () => ({ ok: false }),
      logout:  () => {},
    };
  }
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  function login(email: string, password: string): { ok: boolean; error?: string } {
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (!account) {
      return { ok: false, error: "Email hoặc mật khẩu không đúng" };
    }
    const { password: _pw, ...authUser } = account;
    setUser(authUser);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser)); } catch { /* ignore */ }
    return { ok: true };
  }

  function logout() {
    setUser(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Role → correct dashboard path ───────────────────────────────────────────

export function dashboardForRole(role: AuthRole, user?: AuthUser | null): string {
  if (role === "Chairman" || role === "CTO") return "/cto";
  if (role === "PM")  return user?.projectIds?.[0] ? `/pm/${user.projectIds[0]}/phases` : "/pm/PRJ-001/phases";
  return "/engineer";
}
