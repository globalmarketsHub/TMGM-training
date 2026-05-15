import { QuestionManager } from "@/components/admin/QuestionManager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function QuestionsPage() {
  const questions = await prisma.examQuestion.findMany({
    orderBy: { sortOrder: "asc" }
  });

  return (
    <div className="space-y-6">
      <section className="surface rounded-lg p-6">
        <p className="text-sm font-bold uppercase text-bridge-gold">Question Bank</p>
        <h1 className="mt-3 text-3xl font-black text-white">综合考试题库</h1>
        <p className="mt-3 text-sm text-blue-100">支持选择题、判断题、简答题；停用题目后员工考试不会再显示。</p>
      </section>
      <QuestionManager
        initialQuestions={questions.map((question) => ({
          id: question.id,
          type: question.type,
          prompt: question.prompt,
          options: Array.isArray(question.options) ? (question.options as string[]) : null,
          correctAnswer: question.correctAnswer,
          score: question.score,
          sortOrder: question.sortOrder,
          isActive: question.isActive
        }))}
      />
    </div>
  );
}
