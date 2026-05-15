import { NextResponse } from "next/server";
import { apiError, requireEmployee } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { employee } = await requireEmployee();

    const days = await prisma.trainingDay.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
      include: {
        progress: {
          where: { employeeId: employee.id }
        }
      }
    });

    return NextResponse.json({ days });
  } catch (error) {
    return apiError(error);
  }
}
