import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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

    const data: Prisma.ExamQuestionUpdateInput = {};

    if (parsed.data.type !== undefined) data.type = parsed.data.type;
    if (parsed.data.prompt !== undefined) data.prompt = parsed.data.prompt;
    if (parsed.data.score !== undefined) data.score = parsed.data.score;
    if (parsed.data.sortOrder !== undefined) data.sortOrder = parsed.data.sortOrder;
    if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive;
    if (parsed.data.correctAnswer !== undefined) data.correctAnswer = parsed.data.correctAnswer;
    if (parsed.data.options !== undefined) {
      data.options = parsed.data.options === null ? Prisma.DbNull : parsed.data.options;
    }

    const question = await prisma.examQuestion.update({
      where: { id },
      data
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
