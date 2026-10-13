"use client";

import useUser from "@/hooks/useUser";
import { BADGES } from "@/lib/badges";

export default function BadgeGallery() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="mt-10">
        Loading badges...
      </div>
    );
  }

  const unlocked = user?.badges || [];

  return (
    <section className="mt-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Achievements & Badges</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {unlocked.length} of {BADGES.length} Unlocked
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {BADGES.map((badge) => {
          const earned = unlocked.includes(badge.title);

          return (
            <div
              key={badge.id}
              className={`flex flex-col justify-between rounded-2xl border p-6 transition shadow-xs ${
                earned
                  ? "border-border bg-white"
                  : "border-border/70 bg-slate-50/80 opacity-75"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`inline-flex size-14 items-center justify-center rounded-2xl text-3xl ${
                      earned ? "bg-indigo-50" : "bg-slate-200/70 grayscale"
                    }`}
                  >
                    {badge.icon}
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      earned
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {earned ? "Unlocked" : "Locked"}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {badge.title}
                </h3>

                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  {badge.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}