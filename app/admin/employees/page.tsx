import Link from "next/link";
import { CreateEmployeeForm } from "@/components/admin/CreateEmployeeForm";
import { EmployeeActions } from "@/components/admin/EmployeeActions";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
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
  });

  return (
    <div className="space-y-6">
      <section className="surface rounded-lg p-6">
        <p className="text-sm font-bold uppercase text-bridge-gold">Employee Accounts</p>
        <h1 className="mt-3 text-3xl font-black text-white">员工账号管理</h1>
        <p className="mt-3 text-sm leading-7 text-blue-100">员工不能公开注册，只能由管理员创建；停用或删除后会被 API 和登录系统拦截。</p>
      </section>

      <CreateEmployeeForm />

      <section className="surface rounded-lg p-5">
        <h2 className="mb-4 text-xl font-black text-white">员工列表</h2>
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>员工</th>
                <th>邮箱</th>
                <th>部门 / 职位</th>
                <th>状态</th>
                <th>最后登录</th>
                <th>完成天数</th>
                <th>考试</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const completed = employee.progress.filter((item) => item.status === "COMPLETED").length;
                const latestExam = employee.examResults[0];
                return (
                  <tr key={employee.id}>
                    <td>
                      <Link className="font-bold text-white hover:text-bridge-cyan" href={`/admin/employees/${employee.id}`}>
                        {employee.fullName}
                      </Link>
                      <div className="text-xs text-blue-200">{employee.employeeCode}</div>
                    </td>
                    <td>{employee.user.email}</td>
                    <td>
                      {employee.department ?? "—"}
                      <div className="text-xs text-blue-200">{employee.position ?? ""}</div>
                    </td>
                    <td>
                      <StatusPill status={employee.user.status} />
                    </td>
                    <td>{formatDateTime(employee.user.lastLoginAt)}</td>
                    <td>{completed}/9</td>
                    <td>{latestExam ? `${latestExam.score}/${latestExam.totalScore}` : "—"}</td>
                    <td>
                      <EmployeeActions employeeId={employee.id} status={employee.user.status} />
                    </td>
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
