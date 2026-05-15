import { notFound } from "next/navigation";
import { EmployeeActions } from "@/components/admin/EmployeeActions";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDateTime, formatDuration } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [employee, days] = await Promise.all([
    prisma.employee.findUnique({
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
          include: { trainingDay: true },
          orderBy: { trainingDay: { sortOrder: "asc" } }
        },
        activeTimeLogs: {
          include: { trainingDay: true },
          orderBy: { startedAt: "desc" },
          take: 40
        },
        examResults: {
          include: {
            answers: {
              include: { question: true }
            }
          },
          orderBy: { submittedAt: "desc" }
        }
      }
    }),
    prisma.trainingDay.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" }
    })
  ]);

  if (!employee) {
    notFound();
  }

  const progressByDay = new Map(employee.progress.map((item) => [item.trainingDayId, item]));
  const totalActiveSeconds = employee.progress.reduce((total, item) => total + item.activeSeconds, 0);

  return (
    <div className="space-y-6">
      <section className="surface rounded-lg p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-bold uppercase text-bridge-gold">{employee.employeeCode}</p>
            <h1 className="mt-3 text-3xl font-black text-white">{employee.fullName}</h1>
            <p className="mt-3 text-sm text-blue-100">
              {employee.user.email} · {employee.department ?? "未填写部门"} · {employee.position ?? "未填写职位"}
            </p>
            <p className="mt-2 text-sm text-blue-100">最后登录：{formatDateTime(employee.user.lastLoginAt)}</p>
          </div>
          <div className="space-y-3">
            <StatusPill status={employee.user.status} />
            <EmployeeActions employeeId={employee.id} status={employee.user.status} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface rounded-lg p-5">
          <p className="text-sm text-blue-200">总有效学习时间</p>
          <p className="mt-2 text-2xl font-black text-white">{formatDuration(totalActiveSeconds)}</p>
        </div>
        <div className="surface rounded-lg p-5">
          <p className="text-sm text-blue-200">考试提交次数</p>
          <p className="mt-2 text-2xl font-black text-white">{employee.examResults.length}</p>
        </div>
        <div className="surface rounded-lg p-5">
          <p className="text-sm text-blue-200">最新考试成绩</p>
          <p className="mt-2 text-2xl font-black text-white">
            {employee.examResults[0] ? `${employee.examResults[0].score}/${employee.examResults[0].totalScore}` : "—"}
          </p>
        </div>
      </section>

      <section className="surface rounded-lg p-5">
        <h2 className="mb-4 text-xl font-black text-white">每天学习进度与有效时间</h2>
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>课程</th>
                <th>状态</th>
                <th>有效学习时间</th>
                <th>最后打开</th>
                <th>完成时间</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => {
                const progress = progressByDay.get(day.id);
                return (
                  <tr key={day.id}>
                    <td>{day.dayNumber === 99 ? "Final Exam" : `Day ${day.dayNumber}: ${day.title}`}</td>
                    <td>
                      <StatusPill status={progress?.status ?? "NOT_STARTED"} />
                    </td>
                    <td>{formatDuration(progress?.activeSeconds ?? 0)}</td>
                    <td>{formatDateTime(progress?.lastOpenedAt)}</td>
                    <td>{formatDateTime(progress?.completedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface rounded-lg p-5">
        <h2 className="mb-4 text-xl font-black text-white">考试答卷</h2>
        <div className="space-y-4">
          {employee.examResults.map((result) => (
            <div key={result.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap justify-between gap-3">
                <p className="font-bold text-white">
                  {result.score}/{result.totalScore} · {result.passed ? "通过" : "未通过"}
                </p>
                <p className="text-sm text-blue-200">{formatDateTime(result.submittedAt)}</p>
              </div>
              <div className="mt-4 space-y-3">
                {result.answers.map((answer) => (
                  <div key={answer.id} className="rounded-lg bg-navy-950/50 p-3">
                    <p className="text-sm font-bold text-blue-100">{answer.question.prompt}</p>
                    <p className="mt-2 text-sm text-white">员工答案：{answer.answerText || "未答"}</p>
                    <p className="mt-1 text-xs text-blue-200">得分：{answer.scoreAwarded}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!employee.examResults.length ? <p className="text-sm text-blue-100">暂无考试记录。</p> : null}
        </div>
      </section>
    </div>
  );
}
