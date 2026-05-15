import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { apiError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { examQuestionSchema } from "@/lib/validators";

export async function GET() {
  try {
    await requireAdmin();
    const questions = await prisma.examQuestion.findMany({
      orderBy: { sortOrder: "asc" }
    });
    return NextResponse.json({ questions });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const parsed = examQuestionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "题目信息格式不正确。" }, { status: 400 });
    }

    const question = await prisma.examQuestion.create({
      data: {
        type: parsed.data.type,
        prompt: parsed.data.prompt,
        score: parsed.data.score,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
        options: parsed.data.options === null || parsed.data.options === undefined ? Prisma.DbNull : parsed.data.options,
        correctAnswer: parsed.data.correctAnswer ?? null
      }
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
