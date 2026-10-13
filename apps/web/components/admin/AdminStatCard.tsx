import { ReactNode } from "react";

interface AdminStatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: string;
}

export default function AdminStatCard({
  title,
  value,
  icon,
  color = "text-cyan-400",
}: AdminStatCardProps) {
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-6 shadow-lg transition hover:border-cyan-400">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {value}
          </h2>
        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800 ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}