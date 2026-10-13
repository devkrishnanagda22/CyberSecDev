import Link from "next/link";

export default function LabCard({ lab }: { lab: any }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900 leading-snug">{lab.title}</h3>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
            lab.published
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          }`}>
            {lab.published ? "Published" : "Draft"}
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">{lab.description}</p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-600">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 capitalize">{lab.difficulty}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5">{lab.estimatedHours}h</span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-700">+{lab.xpReward} XP</span>
        </div>

        <Link
          href={`/labs/${lab.slug}`}
          className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-2xs hover:bg-indigo-700 transition shrink-0"
        >
          Open
        </Link>
      </div>
    </div>
  );
}
