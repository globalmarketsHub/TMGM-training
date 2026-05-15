import { NextResponse } from "next/server";
import { apiError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateEmployeeSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            status: true,
            lastLoginAt: true,
            createdAt: true
          }
        },
        progress: {
          include: {
            trainingDay: true
          },
          orderBy: {
            trainingDay: {
              sortOrder: "asc"
            }
          }
        },
        activeTimeLogs: {
          include: {
            trainingDay: true
          },
          orderBy: { startedAt: "desc" },
          take: 80
        },
        examResults: {
          include: {
            answers: {
              include: {
                question: true
              }
            }
          },
          orderBy: { submittedAt: "desc" }
        }
      }
    });

    if (!employee) {
      return NextResponse.json({ error: "员工不存在。" }, { status: 404 });
    }

    return NextResponse.json({ employee });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const parsed = updateEmployeeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "更新内容格式不正确。" }, { status: 400 });
    }

    const current = await prisma.employee.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "员工不存在。" }, { status: 404 });
    }

    const { status, ...employeeData } = parsed.data;
    const employee = await prisma.$transaction(async (tx) => {
      if (status) {
        await tx.user.update({
          where: { id: current.userId },
          data: { status }
        });
      }

      return tx.employee.update({
        where: { id },
        data: {
          ...employeeData,
          deletedAt: status === "DELETED" ? new Date() : status === "ACTIVE" ? null : undefined
        },
        include: {
          user: {
            select: {
              email: true,
              status: true,
              lastLoginAt: true,
              createdAt: true
            }
          }
        }
      });
    });

    return NextResponse.json({ employee });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const current = await prisma.employee.findUnique({ where: { id } });

    if (!current) {
      return NextResponse.json({ error: "员工不存在。" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: current.userId },
        data: { status: "DELETED" }
      }),
      prisma.employee.update({
        where: { id },
        data: { deletedAt: new Date() }
      })
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
