import { NextResponse } from "next/server";
import { apiError, requireAdmin } from "@/lib/auth";
import { toCsv, toExcelHtml } from "@/lib/csv";
import { formatDuration } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") === "xls" ? "xls" : "csv";

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
        progress: {
          include: {
            trainingDay: true
          }
        },
        examResults: {
          orderBy: { submittedAt: "desc" },
          take: 1
        }
      }
    });

    const headers = [
      "员工编号",
      "姓名",
      "邮箱",
      "部门",
      "账号状态",
      "最后登录",
      "已完成天数",
      "总有效学习时间",
      "最新考试成绩",
      "考试提交时间"
    ];

    const rows = employees.map((employee) => {
      const completed = employee.progress.filter((item) => item.status === "COMPLETED").length;
      const activeSeconds = employee.progress.reduce((total, item) => total + item.activeSeconds, 0);
      const latestExam = employee.examResults[0];

      return [
        employee.employeeCode,
        employee.fullName,
        employee.user.email,
        employee.department ?? "",
        employee.user.status,
        employee.user.lastLoginAt?.toISOString() ?? "",
        completed,
        formatDuration(activeSeconds),
        latestExam ? `${latestExam.score}/${latestExam.totalScore}` : "",
        latestExam?.submittedAt.toISOString() ?? ""
      ];
    });

    if (format === "xls") {
      return new NextResponse(toExcelHtml(headers, rows), {
        headers: {
          "Content-Type": "application/vnd.ms-excel; charset=utf-8",
          "Content-Disposition": "attachment; filename=training-progress.xls"
        }
      });
    }

    return new NextResponse(toCsv([headers, ...rows]), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=training-progress.csv"
      }
    });
  } catch (error) {
    return apiError(error);
  }
}
