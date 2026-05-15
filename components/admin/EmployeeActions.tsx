"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, PauseCircle, Trash2 } from "lucide-react";

export function EmployeeActions({
  employeeId,
  status
}: {
  employeeId: string;
  status: "ACTIVE" | "DISABLED" | "DELETED";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  async function patch(nextStatus: "ACTIVE" | "DISABLED" | "DELETED") {
    setLoading(nextStatus);
    await fetch(`/api/admin/employees/${employeeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    setLoading("");
    router.refresh();
  }

  async function remove() {
    if (!confirm("确认删除/停用该员工账号？历史学习数据会保留。")) return;
    setLoading("DELETE");
    await fetch(`/api/admin/employees/${employeeId}`, { method: "DELETE" });
    setLoading("");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "ACTIVE" ? (
        <button className="btn-secondary px-3 py-2 text-xs" disabled={loading === "ACTIVE"} type="button" onClick={() => patch("ACTIVE")}>
          <CheckCircle2 className="h-4 w-4" />
          启用
        </button>
      ) : (
        <button className="btn-secondary px-3 py-2 text-xs" disabled={loading === "DISABLED"} type="button" onClick={() => patch("DISABLED")}>
          <PauseCircle className="h-4 w-4" />
          停用
        </button>
      )}
      <button className="btn-secondary px-3 py-2 text-xs text-red-100" disabled={loading === "DELETE"} type="button" onClick={remove}>
        <Trash2 className="h-4 w-4" />
        删除
      </button>
    </div>
  );
}
