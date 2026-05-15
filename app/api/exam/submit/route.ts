import { NextResponse } from "next/server";
import { apiError, requireEmployee } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitExamSchema } from "@/lib/validators";

function normalizeAnswer(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function POST(request: Request) {
  try {
    const { employee } = await requireEmployee();
    const body = await request.json().catch(() => null);
    const parsed = submitExamSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "考试答案格式不正确。" }, { status: 400 });
    }

    const questions = await prisma.examQuestion.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" }
    });

    if (!questions.length) {
      return NextResponse.json({ error: "当前没有可用考试题。" }, { status: 400 });
    }

    const answerMap = new Map(parsed.data.answers.map((answer) => [answer.questionId, answer.answerText]));
    let score = 0;
    const totalScore = questions.reduce((total, question) => total + question.score, 0);

    const answerCreates = questions.map((question) => {
      const answerText = answerMap.get(question.id) ?? "";
      const normalized = normalizeAnswer(answerText);
      const correct = normalizeAnswer(question.correctAnswer ?? "");
      let isCorrect: boolean | null = null;
      let scoreAwarded = 0;

      if (question.type === "SHORT_TEXT") {
        if (normalized.length >= 8) {
          scoreAwarded = Math.ceil(question.score * 0.5);
        }
      } else {
        isCorrect = normalized === correct;
        scoreAwarded = isCorrect ? question.score : 0;
      }

      score += scoreAwarded;

      return {
        employeeId: employee.id,
        questionId: question.id,
        answerText,
        isCorrect,
        scoreAwarded
      };
    });

    const result = await prisma.$transaction(async (tx) => {
      const examResult = await tx.examResult.create({
        data: {
          employeeId: employee.id,
          score,
          totalScore,
          passed: score / totalScore >= 0.7,
          answers: {
            create: answerCreates
          }
        },
        include: {
          answers: {
            include: {
              question: true
            }
          }
        }
      });

      const finalDay = await tx.trainingDay.findFirst({ where: { isFinalExam: true } });
      if (finalDay) {
        await tx.trainingProgress.upsert({
          where: {
            employeeId_trainingDayId: {
              employeeId: employee.id,
              trainingDayId: finalDay.id
            }
          },
          update: {
            status: "COMPLETED",
            completedAt: new Date(),
            lastOpenedAt: new Date()
          },
          create: {
            employeeId: employee.id,
            trainingDayId: finalDay.id,
            status: "COMPLETED",
            completedAt: new Date(),
            lastOpenedAt: new Date()
          }
        });
      }

      return examResult;
    });

    return NextResponse.json({ result });
  } catch (error) {
    return apiError(error);
  }
}
