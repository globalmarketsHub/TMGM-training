import { NextResponse } from "next/server";
import { apiError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const [days, employees] = await Promise.all([
      prisma.trainingDay.findMany({
        where: { isFinalExam: false },
        orderBy: { sortOrder: "asc" }
      }),
      prisma.employee.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              email: true,
              status: true,
              lastLoginAt: true
            }
          },
          progress: {
            include: {
              trainingDay: true
            }
          },
          examResults: {
            orderBy: { submittedAt: "desc" },
            take: 1
          }
        }
      })
    ]);

    return NextResponse.json({ days, employees });
  } catch (error) {
    return apiError(error);
  }
}
