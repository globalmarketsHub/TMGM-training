import { FileDown } from "lucide-react";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDateTime, formatDuration } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProgressPage() {
  const [days, employees] = await Promise.all([
    prisma.trainingDay.findMany({
      where: { isFinalExam: false },
      orderBy: { sortOrder: "asc" }
    }),
    prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
            status: true,
            lastLoginAt: true
          }
        },
        progress: true,
        examResults: {
          orderBy: { submittedAt: "desc" },
          take: 1
        }
      }
    })
  ]);

  return (
    <div className="space-y-6">
      <section className="surface rounded-lg p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-bridge-gold">Progress Matrix</p>
            <h1 className="mt-3 text-3xl font-black text-white">学习进度与有效时间</h1>
            <p className="mt-3 text-sm text-blue-100">每个 Day 单独汇总有效学习时间；计时器不在员工端显示。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a className="btn-secondary" href="/api/admin/export?format=csv">
              <FileDown className="h-4 w-4" />
              CSV
            </a>
            <a className="btn-secondary" href="/api/admin/export?format=xls">
              <FileDown className="h-4 w-4" />
              Excel
            </a>
          </div>
        </div>
      </section>

      <section className="surface rounded-lg p-5">
        <div className="overflow-x-auto">
          <table className="data-table min-w-[1280px]">
            <thead>
              <tr>
                <th>员工</th>
                <th>状态</th>
                <th>最后登录</th>
                {days.map((day) => (
                  <th key={day.id}>Day {day.dayNumber}</th>
                ))}
                <th>考试</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const progressByDay = new Map(employee.progress.map((item) => [item.trainingDayId, item]));
                const latestExam = employee.examResults[0];
                return (
                  <tr key={employee.id}>
                    <td>
                      <span className="font-bold text-white">{employee.fullName}</span>
                      <div className="text-xs text-blue-200">{employee.employeeCode}</div>
                    </td>
                    <td>
                      <StatusPill status={employee.user.status} />
                    </td>
                    <td>{formatDateTime(employee.user.lastLoginAt)}</td>
                    {days.map((day) => {
                      const progress = progressByDay.get(day.id);
                      return (
                        <td key={day.id}>
                          <StatusPill status={progress?.status ?? "NOT_STARTED"} />
                          <div className="mt-2 text-xs text-blue-200">{formatDuration(progress?.activeSeconds ?? 0)}</div>
                        </td>
                      );
                    })}
                    <td>{latestExam ? `${latestExam.score}/${latestExam.totalScore}` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
