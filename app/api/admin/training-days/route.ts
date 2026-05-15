import { NextResponse } from "next/server";
import { apiError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
    const days = await prisma.trainingDay.findMany({
      orderBy: { sortOrder: "asc" }
    });
    return NextResponse.json({ days });
  } catch (error) {
    return apiError(error);
  }
}
