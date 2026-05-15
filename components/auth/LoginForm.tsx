"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn, Mail } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "登录失败，请检查账号状态。");
      return;
    }

    router.replace(payload.role === "ADMIN" ? "/admin" : "/training");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="glass-panel relative z-10 rounded-lg p-6 md:p-8">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase text-bridge-gold">Secure Login</p>
        <h2 className="mt-3 text-2xl font-black text-white">员工 / 管理员登录</h2>
        <p className="mt-3 text-sm leading-6 text-blue-100">
          员工账号由管理员创建，公开注册入口已关闭。
        </p>
      </div>
      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-100">
            <Mail className="h-4 w-4 text-bridge-cyan" />
            邮箱
          </span>
          <input
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@company.com"
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-100">
            <Lock className="h-4 w-4 text-bridge-cyan" />
            密码
          </span>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="至少 8 位"
            required
          />
        </label>
      </div>
      {error ? (
        <div className="mt-5 rounded-lg border border-red-300/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}
      <button className="btn-primary mt-6 w-full" disabled={loading} type="submit">
        <LogIn className="h-4 w-4" />
        {loading ? "正在登录..." : "进入培训系统"}
      </button>
    </form>
  );
}
