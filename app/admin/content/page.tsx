import { ContentManager } from "@/components/admin/ContentManager";
import { prisma } from "@/lib/prisma";

export default async function ContentPage() {
  const days = await prisma.trainingDay.findMany({
    orderBy: { sortOrder: "asc" }
  });

  return (
    <div className="space-y-6">
      <section className="surface rounded-lg p-6">
        <p className="text-sm font-bold uppercase text-bridge-gold">Training Content</p>
        <h1 className="mt-3 text-3xl font-black text-white">8 天课程模板</h1>
        <p className="mt-3 text-sm text-blue-100">每一天的文字、图片、视频、PDF 和链接都可以在这里替换。内容 JSON 使用 blocks 结构，便于后续扩展。</p>
      </section>
      <ContentManager
        days={days.map((day) => ({
          id: day.id,
          dayNumber: day.dayNumber,
          title: day.title,
          summary: day.summary,
          contentJson: day.contentJson,
          videoUrl: day.videoUrl,
          pdfUrl: day.pdfUrl,
          linkUrl: day.linkUrl,
          isPublished: day.isPublished
        }))}
      />
    </div>
  );
}
