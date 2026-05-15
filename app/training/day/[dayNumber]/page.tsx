import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, PlayCircle } from "lucide-react";
import { CompleteButton } from "@/components/training/CompleteButton";
import { ContentRenderer } from "@/components/training/ContentRenderer";
import { TrainingTimer } from "@/components/training/TrainingTimer";
import { StatusPill } from "@/components/ui/StatusPill";
import { requirePageEmployee } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ dayNumber: string }>;
};

export default async function TrainingDayPage({ params }: PageProps) {
  const { dayNumber } = await params;
  const parsedDay = Number(dayNumber);
  const { employee } = await requirePageEmployee();

  if (!Number.isInteger(parsedDay) || parsedDay < 1 || parsedDay > 8) {
    notFound();
  }

  const day = await prisma.trainingDay.findUnique({
    where: { dayNumber: parsedDay },
    include: {
      progress: {
        where: { employeeId: employee.id }
      }
    }
  });

  if (!day || !day.isPublished || day.isFinalExam) {
    notFound();
  }

  const existingProgress = day.progress[0];
  const progress =
    existingProgress ??
    (await prisma.trainingProgress.create({
      data: {
        employeeId: employee.id,
        trainingDayId: day.id,
        status: "IN_PROGRESS",
        lastOpenedAt: new Date()
      }
    }));

  if (existingProgress) {
    await prisma.trainingProgress.update({
      where: { id: existingProgress.id },
      data: {
        lastOpenedAt: new Date(),
        status: existingProgress.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS"
      }
    });
  }

  const completed = progress.status === "COMPLETED";

  return (
    <div className="space-y-6">
      <TrainingTimer trainingDayId={day.id} />
      <Link href="/training" className="inline-flex items-center gap-2 text-sm font-bold text-blue-100 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        返回培训主页
      </Link>

      <section className="surface rounded-lg p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-bold uppercase text-bridge-gold">Day {day.dayNumber}</p>
            <h1 className="mt-3 text-3xl font-black text-white">{day.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-blue-100">{day.summary}</p>
          </div>
          <StatusPill status={completed ? "COMPLETED" : "IN_PROGRESS"} />
        </div>
      </section>

      {day.videoUrl ? (
        <section className="surface rounded-lg p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-blue-100">
            <PlayCircle className="h-4 w-4 text-bridge-cyan" />
            视频课程
          </div>
          <video controls className="aspect-video w-full rounded-lg border border-white/10 bg-black" src={day.videoUrl} />
        </section>
      ) : null}

      <section className="surface rounded-lg p-6">
        <ContentRenderer content={day.contentJson} />
      </section>

      <div className="flex flex-wrap gap-3">
        {day.pdfUrl ? (
          <a className="btn-secondary" href={day.pdfUrl} target="_blank" rel="noreferrer">
            <FileText className="h-4 w-4" />
            打开 PDF
          </a>
        ) : null}
        {day.linkUrl ? (
          <a className="btn-secondary" href={day.linkUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" />
            打开链接
          </a>
        ) : null}
        <CompleteButton trainingDayId={day.id} completed={completed} />
      </div>
    </div>
  );
}
