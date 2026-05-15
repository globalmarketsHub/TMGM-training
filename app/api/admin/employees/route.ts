import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { apiError, requireAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { createEmployeeSchema } from "@/lib/validators";

export async function GET() {
  try {
    await requireAdmin();

    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
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
          select: {
            status: true,
            activeSeconds: true
          }
        },
        examResults: {
          orderBy: { submittedAt: "desc" },
          take: 1
        }
      }
    });

    return NextResponse.json({ employees });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = createEmployeeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "员工信息不完整或格式不正确。" }, { status: 400 });
    }

    const data = parsed.data;
    const passwordHash = await hashPassword(data.password);

    const employee = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          role: "EMPLOYEE",
          status: "ACTIVE"
        }
      });

      return tx.employee.create({
        data: {
          userId: user.id,
          employeeCode: data.employeeCode,
          fullName: data.fullName,
          department: data.department || null,
          position: data.position || null,
          manager: data.manager || null
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

    return NextResponse.json({ employee }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "邮箱或员工编号已存在。" }, { status: 409 });
    }

    return apiError(error);
  }
}
