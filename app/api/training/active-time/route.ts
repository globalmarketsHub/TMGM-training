import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { apiError, requireEmployee } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { activeTimeSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const { employee } = await requireEmployee();
    const body = await request.json().catch(() => null);
    const parsed = activeTimeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "计时数据格式不正确。" }, { status: 400 });
    }

    const data = parsed.data;
    const trainingDay = await prisma.trainingDay.findUnique({
      where: { id: data.trainingDayId }
    });

    if (!trainingDay || !trainingDay.isPublished || trainingDay.isFinalExam) {
      return NextResponse.json({ error: "课程不存在或不可计时。" }, { status: 404 });
    }

    const endedAt = data.endedAt ? new Date(data.endedAt) : new Date();
    const startedAt = data.startedAt ? new Date(data.startedAt) : new Date(endedAt.getTime() - data.seconds * 1000);

    await prisma.$transaction([
      prisma.activeTimeLog.create({
        data: {
          employeeId: employee.id,
          trainingDayId: trainingDay.id,
          durationSeconds: data.seconds,
          startedAt,
          endedAt,
          source: data.source,
          clientMeta: data.clientMeta as Prisma.InputJsonValue | undefined
        }
      }),
      prisma.trainingProgress.upsert({
        where: {
          employeeId_trainingDayId: {
            employeeId: employee.id,
            trainingDayId: trainingDay.id
          }
        },
        update: {
          activeSeconds: { increment: data.seconds },
          lastOpenedAt: new Date()
        },
        create: {
          employeeId: employee.id,
          trainingDayId: trainingDay.id,
          activeSeconds: data.seconds,
          status: "IN_PROGRESS",
          lastOpenedAt: new Date()
        }
      })
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
