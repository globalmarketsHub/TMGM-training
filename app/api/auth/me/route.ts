import { NextResponse } from "next/server";
import { apiError, requireCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const { user, employee } = await requireCurrentUser();
    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      employee
    });
  } catch (error) {
    return apiError(error);
  }
}
