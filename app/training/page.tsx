import Link from "next/link";
import { BookOpen, CheckCircle2, ClipboardCheck, TimerReset } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { requirePageEmployee } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TrainingHomePage() {
  const { employee } = await requirePageEmployee();

  const [days, latestExam] = await Promise.all([
    prisma.trainingDay.findMany({
      where: { isPublished: true, isFinalExam: false },
      orderBy: { sortOrder: "asc" },
      include: {
        progress: {
          where: { employeeId: employee.id }
        }
      }
    }),
    prisma.examResult.findFirst({
      where: { employeeId: employee.id },
      orderBy: { submittedAt: "desc" }
    })
  ]);

  const completed = days.filter((day) => day.progress[0]?.status === "COMPLETED").length;
  const inProgress = days.filter((day) => day.progress[0]?.status === "IN_PROGRESS").length;

  return (
    <div className="space-y-6">
      <section className="surface rounded-lg p-6">
        <p className="text-sm font-bold uppercase text-bridge-gold">Training Path</p>
        <h1 className="mt-3 text-3xl font-black text-white">8 天员工培训任务</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-blue-100">
          每一天是独立教学页面，可承载文字、图片、视频、PDF 和链接。完成后点击完成按钮，综合考试在最后进入。
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="已完成 Day" value={`${completed}/8`} helper="按完成按钮记录" icon={CheckCircle2} />
        <MetricCard title="进行中" value={inProgress} helper="已打开但未完成的课程" icon={TimerReset} />
        <MetricCard title="综合考试" value={latestExam ? `${latestExam.score}/${latestExam.totalScore}` : "未提交"} helper="提交后管理员可查看答卷" icon={ClipboardCheck} />
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {days.map((day) => {
          const progress = day.progress[0];
          return (
            <Link key={day.id} href={`/training/day/${day.dayNumber}`} className="surface rounded-lg p-5 transition hover:border-bridge-cyan/40 hover:bg-white/[0.08]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-bridge-cyan/25 bg-bridge-blue/[0.35]">
                  <BookOpen className="h-5 w-5 text-bridge-cyan" />
                </div>
                <StatusPill status={progress?.status ?? "NOT_STARTED"} />
              </div>
              <p className="mt-5 text-sm font-bold uppercase text-bridge-gold">Day {day.dayNumber}</p>
              <h2 className="mt-2 text-lg font-black text-white">{day.title}</h2>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-blue-100">{day.summary}</p>
            </Link>
          );
        })}
      </section>

      <Link href="/training/final-exam" className="surface flex flex-col justify-between gap-4 rounded-lg p-6 transition hover:border-bridge-gold/50 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase text-bridge-gold">Final Exam</p>
          <h2 className="mt-2 text-2xl font-black text-white">综合考试</h2>
          <p className="mt-2 text-sm text-blue-100">支持选择题、判断题、简答题，提交后记录成绩和答卷。</p>
        </div>
        <span className="btn-primary">进入考试</span>
      </Link>
    </div>
  );
}
