"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url, { credentials: "same-origin" }).then((r) => r.json());

export default function Leaderboard() {
  const { data, error } = useSWR('/api/leaderboard', fetcher);

  if (error) return <div>Error loading leaderboard.</div>;
  if (!data) return <div>Loading...</div>;

  const top = data.top || [];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Global Leaderboard</h2>
      <ol className="mt-3 space-y-2">
        {top.map((u: any, idx: number) => (
          <li key={u._id} className="flex items-center gap-3">
            <span className="w-6 font-mono">#{idx + 1}</span>
            <img src={u.image || '/images/default-avatar.png'} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
            <div className="flex-1">
              <div className="font-medium">{u.name || u.username}</div>
              <div className="text-sm text-muted-foreground">Level {u.level} • {u.xp} XP</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
