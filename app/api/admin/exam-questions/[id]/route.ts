import { NextResponse } from "next/server";
import { apiError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { examQuestionSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const parsed = examQuestionSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "题目信息格式不正确。" }, { status: 400 });
    }

    const question = await prisma.examQuestion.update({
      where: { id },
      data: parsed.data
    });

    return NextResponse.json({ question });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    await prisma.examQuestion.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
