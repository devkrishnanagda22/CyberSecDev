import Link from "next/link";
import { FlaskConical, Clock, Star, ArrowRight } from "lucide-react";

type RecentLabItem = {
  _id?: string;
  title?: string;
  slug?: string;
  completed?: boolean;
  started?: boolean;
  completedAt?: string | null;
  xpReward?: number;
  coinsReward?: number;
};

interface RecentLabsProps {
  labs?: RecentLabItem[];
  loading?: boolean;
}

function formatLabDate(value?: string | null): string {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function RecentLabs({ labs = [], loading = false }: RecentLabsProps) {
  if (loading) {
    return (
      <section className="mt-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recent Labs</h2>
        </div>
        <div className="rounded-2xl border border-border bg-white p-8 text-sm text-slate-500 shadow-xs">
          Loading recent labs...
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Recent Labs</h2>
        <Link href="/labs" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-indigo-700">
          View All Labs
          <ArrowRight size={14} />
        </Link>
      </div>

      {labs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center text-sm text-slate-600 shadow-xs">
          No lab activity recorded yet. Explore our hands-on labs to get started.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {labs.map((lab) => (
            <div
              key={lab._id ?? lab.title ?? "lab-card"}
              className="flex flex-col justify-between rounded-2xl border border-border bg-white p-6 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="inline-flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-primary">
                    <FlaskConical size={20} />
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    lab.completed ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"
                  }`}>
                    {lab.completed ? "Completed" : lab.started ? "In Progress" : "Started"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{lab.title || "Lab Challenge"}</h3>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{formatLabDate(lab.completedAt)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-600 font-medium">
                    <Star size={14} />
                    <span>+{lab.xpReward ?? 0} XP</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href={lab.slug ? `/labs/${lab.slug}` : "/labs"}
                  className="block w-full rounded-lg bg-primary py-2 text-center text-xs font-semibold text-primary-foreground shadow-xs transition hover:bg-indigo-700"
                >
                  {lab.completed ? "Review Lab" : "Open Lab"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}