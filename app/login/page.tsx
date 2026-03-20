"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Network, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const [email,     setEmail]    = useState("");
  const [password,  setPassword] = useState("");
  const [showPass,  setShowPass] = useState(false);
  const [remember,  setRemember] = useState(false);
  const [error,     setError]    = useState("");
  const [shake,     setShake]    = useState(false);
  const [loading,   setLoading]  = useState(false);
  const [toast,     setToast]    = useState<string | null>(null);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user) router.replace(user.redirect);
  }, [user, router]);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      triggerShake();
      return;
    }
    setLoading(true);
    setError("");
    // Tiny artificial delay for realism
    await new Promise((r) => setTimeout(r, 400));
    const result = login(email.trim(), password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Email hoặc mật khẩu không đúng");
      triggerShake();
      return;
    }
    // Show toast then redirect
    const account = result as { ok: true };
    void account;
    setToast(`Đăng nhập thành công. Xin chào, ${email.split("@")[0]}!`);
    setTimeout(() => router.replace(
      email.toLowerCase().startsWith("cto") ? "/cto" :
      email.toLowerCase().startsWith("pm.alice") ? "/pm/PRJ-001" :
      email.toLowerCase().startsWith("pm.bob")   ? "/pm/PRJ-002" :
      "/engineer"
    ), 800);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#f5f6fa" }}
    >
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      <div className="w-full max-w-sm space-y-5">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl shadow-md" style={{ backgroundColor: "#063986" }}>
            <Network className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight" style={{ color: "#063986" }}>Lancsnetworks</h1>
            <p className="text-xs text-gray-500 mt-0.5">Hệ thống Quản lý Dự án Lancs Networks</p>
          </div>
        </div>

        {/* Card */}
        <div
          className={cn(
            "bg-white rounded-2xl shadow-md p-7 space-y-5 transition-transform",
            shake && "animate-shake"
          )}
        >
          <div className="space-y-1">
            <h2 className="text-base font-bold text-gray-800">Đăng nhập hệ thống QLDA</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="email@lancsnetworks.vn"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ "--tw-ring-color": "#063986" } as React.CSSProperties}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700" htmlFor="password">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{ "--tw-ring-color": "#063986" } as React.CSSProperties}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <p className="text-xs text-red-500 font-medium mt-1">{error}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 accent-[#063986]"
              />
              <label htmlFor="remember" className="text-xs text-gray-600 cursor-pointer select-none">
                Ghi nhớ đăng nhập
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: "#063986" }}
            >
              {loading ? "Đang xác thực..." : "Đăng nhập"}
            </button>
          </form>

          {/* Forgot */}
          <div className="text-center">
            <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Quên mật khẩu?
            </button>
          </div>
        </div>

        {/* Demo hint */}
        <div className="bg-white/80 border border-gray-200 rounded-xl px-4 py-3 space-y-1 text-xs text-gray-500">
          <p className="font-semibold text-gray-600">Demo accounts:</p>
          <p>CTO: <span className="font-mono text-gray-700">cto@lancs.vn</span></p>
          <p>PM: <span className="font-mono text-gray-700">pm.alice@lancs.vn</span></p>
          <p>KS: <span className="font-mono text-gray-700">james@lancs.vn</span></p>
          <p className="pt-0.5">Mật khẩu: <span className="font-mono font-semibold text-gray-700">123456</span></p>
        </div>
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%,100%{ transform:translateX(0) }
          20%    { transform:translateX(-6px) }
          40%    { transform:translateX(6px) }
          60%    { transform:translateX(-4px) }
          80%    { transform:translateX(4px) }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
