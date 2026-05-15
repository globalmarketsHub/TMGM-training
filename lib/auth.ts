import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "tmgm_training_session";

export type SessionPayload = {
  userId: string;
  email: string;
  role: Role;
  employeeId?: string | null;
  name?: string | null;
};

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      role: payload.role as Role,
      employeeId: payload.employeeId ? String(payload.employeeId) : null,
      name: payload.name ? String(payload.name) : null
    };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function requireCurrentUser() {
  const session = await getSession();
  if (!session) {
    throw new HttpError(401, "Unauthenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { employee: true }
  });

  if (!user || user.status !== "ACTIVE") {
    throw new HttpError(401, "Account is not active");
  }

  if (user.role === "EMPLOYEE" && (!user.employee || user.employee.deletedAt)) {
    throw new HttpError(401, "Employee profile is not active");
  }

  return { session, user, employee: user.employee };
}

export async function requireAdmin() {
  const context = await requireCurrentUser();
  if (context.user.role !== "ADMIN") {
    throw new HttpError(403, "Admin permission required");
  }
  return context;
}

export async function requireEmployee() {
  const context = await requireCurrentUser();
  if (context.user.role !== "EMPLOYEE" || !context.employee) {
    throw new HttpError(403, "Employee permission required");
  }
  return { ...context, employee: context.employee };
}

export async function requirePageUser() {
  try {
    return await requireCurrentUser();
  } catch {
    redirect("/login");
  }
}

export async function requirePageAdmin() {
  const context = await requirePageUser();
  if (context.user.role !== "ADMIN") {
    redirect("/training");
  }
  return context;
}

export async function requirePageEmployee() {
  const context = await requirePageUser();
  if (context.user.role !== "EMPLOYEE" || !context.employee) {
    redirect("/admin");
  }
  return { ...context, employee: context.employee };
}

export function apiError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
