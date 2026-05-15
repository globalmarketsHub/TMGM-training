import { ExamForm } from "@/components/training/ExamForm";
import { requirePageEmployee } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FinalExamPage() {
  const { employee } = await requirePageEmployee();

  const [questions, latestResult] = await Promise.all([
    prisma.examQuestion.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" }
    }),
    prisma.examResult.findFirst({
      where: { employeeId: employee.id },
      orderBy: { submittedAt: "desc" }
    })
  ]);

  return (
    <div className="space-y-6">
      <section className="surface rounded-lg p-6">
        <p className="text-sm font-bold uppercase text-bridge-gold">Final Exam</p>
        <h1 className="mt-3 text-3xl font-black text-white">综合考试</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-blue-100">
          当前题库包含选择题、判断题和简答题。简答题会记录原文答案，管理员可在考试结果中查看。
        </p>
        {latestResult ? (
          <p className="mt-4 text-sm text-blue-100">
            最近一次提交：{latestResult.score}/{latestResult.totalScore}，{formatDateTime(latestResult.submittedAt)}
          </p>
        ) : null}
      </section>
      <ExamForm
        questions={questions.map((question) => ({
          id: question.id,
          type: question.type,
          prompt: question.prompt,
          options: Array.isArray(question.options) ? (question.options as string[]) : null,
          score: question.score
        }))}
      />
    </div>
  );
}
