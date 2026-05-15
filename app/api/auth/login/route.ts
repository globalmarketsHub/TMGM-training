import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "请输入有效邮箱和密码。" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    include: { employee: true }
  });

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "账号不存在或已停用。" }, { status: 401 });
  }

  if (user.role === "EMPLOYEE" && (!user.employee || user.employee.deletedAt)) {
    return NextResponse.json({ error: "员工账号已停用或删除。" }, { status: 401 });
  }

  const passwordOk = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!passwordOk) {
    return NextResponse.json({ error: "账号或密码错误。" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    employeeId: user.employee?.id ?? null,
    name: user.employee?.fullName ?? null
  });

  const response = NextResponse.json({
    ok: true,
    role: user.role,
    employeeId: user.employee?.id ?? null
  });
  setSessionCookie(response, token);
  return response;
}
