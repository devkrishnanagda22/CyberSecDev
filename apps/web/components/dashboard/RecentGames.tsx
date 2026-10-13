import Link from "next/link";
import { Gamepad2, Trophy, ArrowRight } from "lucide-react";

type RecentGameItem = {
  _id?: string;
  title?: string;
  slug?: string;
  score?: number;
  completed?: boolean;
  completedAt?: string | null;
  xpReward?: number;
  coinsReward?: number;
};

interface RecentGamesProps {
  games?: RecentGameItem[];
  loading?: boolean;
}

function formatGameDate(value?: string | null): string {
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

export default function RecentGames({ games = [], loading = false }: RecentGamesProps) {
  if (loading) {
    return (
      <section className="mt-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Cyber Games</h2>
        </div>
        <div className="rounded-2xl border border-border bg-white p-8 text-sm text-slate-500 shadow-xs">
          Loading games activity...
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Cyber Games</h2>
        <Link href="/games" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-indigo-700">
          View All Games
          <ArrowRight size={14} />
        </Link>
      </div>

      {games.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center text-sm text-slate-600 shadow-xs">
          No game activity recorded yet. Try an interactive cybersecurity mini-game.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {games.map((game) => (
            <div
              key={game._id ?? game.title ?? "game-card"}
              className="flex flex-col justify-between rounded-2xl border border-border bg-white p-6 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-primary">
                    <Gamepad2 size={20} />
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    game.completed ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"
                  }`}>
                    {game.completed ? "Completed" : "Played"}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-900">{game.title || "Mini-Game"}</h3>

                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                  <Trophy size={14} />
                  <span>Score: {game.score ?? 0}</span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{formatGameDate(game.completedAt)}</span>
                  <span>+{game.xpReward ?? 0} XP • +{game.coinsReward ?? 0} Coins</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href={game.slug ? `/games/${game.slug}` : "/games"}
                  className="block w-full rounded-lg bg-primary py-2 text-center text-xs font-semibold text-primary-foreground shadow-xs transition hover:bg-indigo-700"
                >
                  {game.completed ? "Play Again" : "Play Game"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}