import clsx from "clsx";
import { statusLabel } from "@/lib/format";

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "ACTIVE" || status === "COMPLETED"
      ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
      : status === "IN_PROGRESS"
        ? "border-cyan-300/25 bg-cyan-400/10 text-cyan-100"
        : status === "DISABLED" || status === "DELETED"
          ? "border-red-300/25 bg-red-400/10 text-red-100"
          : "border-white/[0.15] bg-white/[0.08] text-blue-100";

  return <span className={clsx("inline-flex rounded-full border px-2.5 py-1 text-xs font-bold", tone)}>{statusLabel(status)}</span>;
}
