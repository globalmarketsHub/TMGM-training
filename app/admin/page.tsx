import Link from "next/link";
import { BarChart3, ClipboardCheck, Clock3, Users } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDateTime, formatDuration } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [employees, progress, timeAggregate, recentExams] = await Promise.all([
    prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: {
          select: {
            email: true,
            status: true,
            lastLoginAt: true
          }
        },
        examResults: {
          orderBy: { submittedAt: "desc" },
          take: 1
        }
      }
    }),
    prisma.trainingProgress.findMany({
      include: { trainingDay: true }
    }),
    prisma.trainingProgress.aggregate({
      _sum: { activeSeconds: true }
    }),
    prisma.examResult.findMany({
      orderBy: { submittedAt: "desc" },
      take: 10,
      include: {
        employee: true
      }
    })
  ]);

  const employeeCount = await prisma.employee.count({ where: { deletedAt: null } });
  const completedRecords = progress.filter((item) => item.status === "COMPLETED" && !item.trainingDay.isFinalExam).length;
  const completionRate = employeeCount ? Math.round((completedRecords / (employeeCount * 8)) * 100) : 0;
  const examAverage = recentExams.length
    ? Math.round(recentExams.reduce((total, exam) => total + (exam.score / exam.totalScore) * 100, 0) / recentExams.length)
    : 0;

  return (
    <div className="space-y-6">
      <section className="surface rounded-lg p-6">
        <p className="text-sm font-bold uppercase text-bridge-gold">Admin CRM Overview</p>
        <h1 className="mt-3 text-3xl font-black text-white">培训后台总览</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-blue-100">
          管理员工账号、学习进度、有效学习时间、考试成绩和课程模板。所有员工账号由管理员创建，停用或删除后立即无法登录。
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="员工账号" value={employeeCount} helper="未删除员工" icon={Users} />
        <MetricCard title="培训完成率" value={`${completionRate}%`} helper="8 天课程完成记录" icon={BarChart3} />
        <MetricCard title="有效学习总时长" value={formatDuration(timeAggregate._sum.activeSeconds ?? 0)} helper="管理员可见，员工端隐藏" icon={Clock3} />
        <MetricCard title="近期考试均分" value={`${examAverage}%`} helper="最近 10 次提交" icon={ClipboardCheck} />
      </div>

      <section className="surface rounded-lg p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black text-white">最近员工</h2>
          <Link className="btn-secondary px-3 py-2 text-xs" href="/admin/employees">
            查看全部
          </Link>
        </div>
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>员工</th>
                <th>邮箱</th>
                <th>账号状态</th>
                <th>最后登录</th>
                <th>最新考试</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <Link className="font-bold text-white hover:text-bridge-cyan" href={`/admin/employees/${employee.id}`}>
                      {employee.fullName}
                    </Link>
                    <div className="text-xs text-blue-200">{employee.employeeCode}</div>
                  </td>
                  <td>{employee.user.email}</td>
                  <td>
                    <StatusPill status={employee.user.status} />
                  </td>
                  <td>{formatDateTime(employee.user.lastLoginAt)}</td>
                  <td>{employee.examResults[0] ? `${employee.examResults[0].score}/${employee.examResults[0].totalScore}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
