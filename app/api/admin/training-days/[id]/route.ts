import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { apiError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { trainingDayUpdateSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const parsed = trainingDayUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "课程内容格式不正确。" }, { status: 400 });
    }

    const data = parsed.data;
    const day = await prisma.trainingDay.update({
      where: { id },
      data: {
        title: data.title,
        summary: data.summary,
        contentJson: data.contentJson as Prisma.InputJsonValue,
        videoUrl: data.videoUrl || null,
        pdfUrl: data.pdfUrl || null,
        linkUrl: data.linkUrl || null,
        isPublished: data.isPublished
      }
    });

    return NextResponse.json({ day });
  } catch (error) {
    return apiError(error);
  }
}
