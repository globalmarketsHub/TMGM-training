import { NextResponse } from "next/server";
import { apiError, requireEmployee } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { progressSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const { employee } = await requireEmployee();
    const body = await request.json().catch(() => null);
    const parsed = progressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "学习进度格式不正确。" }, { status: 400 });
    }

    const data = parsed.data;
    const day = await prisma.trainingDay.findUnique({ where: { id: data.trainingDayId } });

    if (!day || !day.isPublished) {
      return NextResponse.json({ error: "课程不存在。" }, { status: 404 });
    }

    const progress = await prisma.trainingProgress.upsert({
      where: {
        employeeId_trainingDayId: {
          employeeId: employee.id,
          trainingDayId: day.id
        }
      },
      update: {
        status: data.status,
        lastOpenedAt: new Date(),
        completedAt: data.status === "COMPLETED" ? new Date() : undefined
      },
      create: {
        employeeId: employee.id,
        trainingDayId: day.id,
        status: data.status,
        lastOpenedAt: new Date(),
        completedAt: data.status === "COMPLETED" ? new Date() : null
      }
    });

    return NextResponse.json({ progress });
  } catch (error) {
    return apiError(error);
  }
}
