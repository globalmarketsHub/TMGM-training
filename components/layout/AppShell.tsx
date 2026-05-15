"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Database,
  FileDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Shield,
  Users
} from "lucide-react";
import clsx from "clsx";
import type { Role } from "@prisma/client";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const adminNav: NavItem[] = [
  { href: "/admin", label: "总览", icon: LayoutDashboard },
  { href: "/admin/employees", label: "员工账号", icon: Users },
  { href: "/admin/progress", label: "学习进度", icon: BarChart3 },
  { href: "/admin/exams", label: "考试结果", icon: ClipboardCheck },
  { href: "/admin/questions", label: "题库管理", icon: Database },
  { href: "/admin/content", label: "课程内容", icon: BookOpen }
];

const employeeNav: NavItem[] = [
  { href: "/training", label: "培训主页", icon: GraduationCap },
  { href: "/training/final-exam", label: "综合考试", icon: ClipboardCheck }
];

export function AppShell({
  children,
  role,
  name,
  email
}: {
  children: React.ReactNode;
  role: Role;
  name?: string | null;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const items = role === "ADMIN" ? adminNav : employeeNav;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="fintech-bg min-h-screen">
      <div className="market-lines" />
      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-navy-950/[0.76] px-5 py-6 backdrop-blur-xl lg:block">
          <Link href={role === "ADMIN" ? "/admin" : "/training"} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-navy-950">
              <Shield className="h-6 w-6 text-bridge-blue" />
            </div>
            <div>
              <p className="text-sm font-black uppercase text-white">TMGM Training</p>
              <p className="text-xs font-semibold text-bridge-gold">Chelsea blue console</p>
            </div>
          </Link>
          <nav className="mt-9 space-y-2">
            {items.map((item) => {
              const active =
                item.href === "/admin" || item.href === "/training"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition",
                    active
                      ? "border border-bridge-cyan/[0.35] bg-bridge-blue/40 text-white"
                      : "text-blue-100 hover:bg-white/[0.08] hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {role === "ADMIN" ? (
            <a className="btn-secondary mt-8 w-full" href="/api/admin/export?format=csv">
              <FileDown className="h-4 w-4" />
              导出 CSV
            </a>
          ) : null}
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-navy-950/[0.72] px-4 py-4 backdrop-blur-xl sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-bridge-gold">
                  {role === "ADMIN" ? "Admin CRM" : "Employee Training"}
                </p>
                <p className="truncate text-sm text-blue-100">{name || email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge hidden sm:inline-flex">{role === "ADMIN" ? "管理员" : "员工"}</span>
                <button className="btn-secondary px-3" type="button" onClick={logout} title="退出登录">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">退出</span>
                </button>
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
