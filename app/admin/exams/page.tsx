import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function AdminExamsPage() {
  const results = await prisma.examResult.findMany({
    orderBy: { submittedAt: "desc" },
    include: {
      employee: {
        include: {
          user: {
            select: { email: true }
          }
        }
      },
      answers: {
        include: { question: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <section className="surface rounded-lg p-6">
        <p className="text-sm font-bold uppercase text-bridge-gold">Exam Results</p>
        <h1 className="mt-3 text-3xl font-black text-white">考试成绩与答卷</h1>
        <p className="mt-3 text-sm text-blue-100">选择题和判断题自动判分，简答题保留答案供管理员复核。</p>
      </section>

      <section className="surface rounded-lg p-5">
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>员工</th>
                <th>邮箱</th>
                <th>成绩</th>
                <th>状态</th>
                <th>提交时间</th>
                <th>答题数</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id}>
                  <td>
                    <Link className="font-bold text-white hover:text-bridge-cyan" href={`/admin/employees/${result.employeeId}`}>
                      {result.employee.fullName}
                    </Link>
                  </td>
                  <td>{result.employee.user.email}</td>
                  <td>{result.score}/{result.totalScore}</td>
                  <td>{result.passed ? "通过" : "未通过"}</td>
                  <td>{formatDateTime(result.submittedAt)}</td>
                  <td>{result.answers.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
