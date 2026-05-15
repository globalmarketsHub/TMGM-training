import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();

  if (session?.role === "ADMIN") {
    redirect("/admin");
  }

  if (session?.role === "EMPLOYEE") {
    redirect("/training");
  }

  return (
    <main className="fintech-bg flex min-h-screen items-center justify-center px-5 py-10">
      <div className="market-lines" />
      <section className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/[0.15] bg-white/[0.08] px-4 py-2 text-sm text-cyan-100">
            <span className="h-2 w-2 rounded-full bg-bridge-green" />
            Enterprise Training CRM
          </div>
          <div className="space-y-5">
            <p className="text-sm font-bold uppercase text-bridge-gold">TMGM x Chelsea style</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl">
              员工培训后台系统
            </h1>
            <p className="max-w-2xl text-base leading-8 text-blue-100 md:text-lg">
              深蓝金融科技风格的企业培训控制台，覆盖账号权限、8 天培训、有效学习计时、综合考试和管理员进度看板。
            </p>
          </div>
          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {["No public signup", "Role based access", "Active time audit"].map((item) => (
              <div key={item} className="surface rounded-lg p-4 text-sm font-semibold text-blue-100">
                {item}
              </div>
            ))}
          </div>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
