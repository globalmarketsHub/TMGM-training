import type { LucideIcon } from "lucide-react";

export function MetricCard({
  title,
  value,
  helper,
  icon: Icon
}: {
  title: string;
  value: string | number;
  helper?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="surface rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-blue-200">{title}</p>
          <p className="mt-3 text-3xl font-black text-white">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-bridge-cyan/25 bg-bridge-blue/[0.35]">
          <Icon className="h-5 w-5 text-bridge-cyan" />
        </div>
      </div>
      {helper ? <p className="mt-3 text-sm text-blue-200/80">{helper}</p> : null}
    </div>
  );
}
