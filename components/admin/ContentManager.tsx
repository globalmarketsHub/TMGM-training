"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

type TrainingDay = {
  id: string;
  dayNumber: number | null;
  title: string;
  summary: string;
  contentJson: unknown;
  videoUrl: string | null;
  pdfUrl: string | null;
  linkUrl: string | null;
  isPublished: boolean;
};

export function ContentManager({ days }: { days: TrainingDay[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(days[0]?.id ?? "");
  const selected = useMemo(() => days.find((day) => day.id === selectedId) ?? days[0], [days, selectedId]);
  const [draft, setDraft] = useState(() => ({
    title: selected?.title ?? "",
    summary: selected?.summary ?? "",
    contentJson: JSON.stringify(selected?.contentJson ?? { blocks: [] }, null, 2),
    videoUrl: selected?.videoUrl ?? "",
    pdfUrl: selected?.pdfUrl ?? "",
    linkUrl: selected?.linkUrl ?? "",
    isPublished: selected?.isPublished ?? true
  }));
  const [message, setMessage] = useState("");

  function choose(id: string) {
    const day = days.find((item) => item.id === id);
    if (!day) return;
    setSelectedId(id);
    setDraft({
      title: day.title,
      summary: day.summary,
      contentJson: JSON.stringify(day.contentJson ?? { blocks: [] }, null, 2),
      videoUrl: day.videoUrl ?? "",
      pdfUrl: day.pdfUrl ?? "",
      linkUrl: day.linkUrl ?? "",
      isPublished: day.isPublished
    });
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(draft.contentJson);
    } catch {
      setMessage("JSON 内容格式不正确。");
      return;
    }

    const response = await fetch(`/api/admin/training-days/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, contentJson: parsedJson })
    });

    setMessage(response.ok ? "课程内容已保存。" : "保存失败。");
    router.refresh();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
      <aside className="surface rounded-lg p-4">
        <div className="space-y-2">
          {days.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => choose(day.id)}
              className={`w-full rounded-lg px-3 py-3 text-left text-sm font-bold ${selectedId === day.id ? "bg-bridge-blue/[0.45] text-white" : "text-blue-100 hover:bg-white/[0.08]"}`}
            >
              {day.dayNumber === 99 ? "Final Exam" : `Day ${day.dayNumber}`} · {day.title}
            </button>
          ))}
        </div>
      </aside>
      <form onSubmit={save} className="surface rounded-lg p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <input className="input md:col-span-2" value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
          <textarea className="input min-h-24 md:col-span-2" value={draft.summary} onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))} />
          <input className="input" placeholder="视频 URL" value={draft.videoUrl} onChange={(event) => setDraft((current) => ({ ...current, videoUrl: event.target.value }))} />
          <input className="input" placeholder="PDF URL" value={draft.pdfUrl} onChange={(event) => setDraft((current) => ({ ...current, pdfUrl: event.target.value }))} />
          <input className="input md:col-span-2" placeholder="外部链接 URL" value={draft.linkUrl} onChange={(event) => setDraft((current) => ({ ...current, linkUrl: event.target.value }))} />
          <label className="flex items-center gap-3 text-sm font-bold text-blue-100">
            <input type="checkbox" checked={draft.isPublished} onChange={(event) => setDraft((current) => ({ ...current, isPublished: event.target.checked }))} />
            发布课程
          </label>
        </div>
        <label className="mt-4 block">
          <span className="mb-2 block text-sm font-bold text-blue-100">内容 JSON 模板</span>
          <textarea className="input min-h-96 font-mono text-sm" value={draft.contentJson} onChange={(event) => setDraft((current) => ({ ...current, contentJson: event.target.value }))} />
        </label>
        {message ? <p className="mt-4 text-sm text-blue-100">{message}</p> : null}
        <button className="btn-primary mt-5" type="submit">
          <Save className="h-4 w-4" />
          保存课程
        </button>
      </form>
    </div>
  );
}
