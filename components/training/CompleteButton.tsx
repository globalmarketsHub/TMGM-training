"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function CompleteButton({
  trainingDayId,
  completed
}: {
  trainingDayId: string;
  completed: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function complete() {
    setLoading(true);
    await fetch("/api/training/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainingDayId, status: "COMPLETED" })
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button className="btn-primary" disabled={loading || completed} type="button" onClick={complete}>
      <CheckCircle2 className="h-4 w-4" />
      {completed ? "已完成" : loading ? "正在保存..." : "标记完成"}
    </button>
  );
}
