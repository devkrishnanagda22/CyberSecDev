"use client";

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url, { credentials: "same-origin" }).then(r => r.json());

export default function Achievements() {
  const { data, error } = useSWR('/api/achievements', fetcher);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
        Error loading achievements.
      </div>
    );
  }

  if (!data) {
    return <div className="text-sm text-slate-500">Loading achievements...</div>;
  }

  const badges = data.badges || [];

  return (
    <div>
      <div className="space-y-3">
        {badges.length === 0 ? (
          <div className="text-sm text-slate-500">No badges earned yet. Complete lessons and labs to unlock badges!</div>
        ) : (
          badges.map((b: string) => (
            <div key={b} className="flex items-center gap-3.5 rounded-xl border border-border bg-slate-50/70 p-3.5 transition hover:bg-slate-100/70">
              <div className="h-10 w-10 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-lg border border-amber-200">
                🏆
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{b}</div>
                <div className="text-xs text-slate-500">Unlocked achievement badge</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
