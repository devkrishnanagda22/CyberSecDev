import { notFound } from "next/navigation";

import GameSubmission from "@/components/games/GameSubmission";
import { connectDB } from "@/lib/mongodb";
import Game from "@/models/Game";
import GameScore from "@/models/GameScore";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function GameDetailPage({ params }: Props) {
  await connectDB();

  const { slug } = await params;

  const game: any = await Game.findOne({
    slug,
    published: true,
  }).lean();

  if (!game) {
    notFound();
  }

  const leaderboard = await GameScore.find({ gameId: game._id })
    .sort({ score: -1, createdAt: 1 })
    .limit(5)
    .populate("userId", "name username")
    .lean();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl p-8">
        <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/80 p-8 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Cyber challenge</p>
          <h1 className="mt-3 text-4xl font-bold">{game.title}</h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-400">{game.description}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-slate-950/70 p-4">
              <p className="text-sm text-gray-400">Difficulty</p>
              <p className="mt-2 text-xl font-bold">{game.difficulty || "Beginner"}</p>
            </div>
            <div className="rounded-xl bg-slate-950/70 p-4">
              <p className="text-sm text-gray-400">Category</p>
              <p className="mt-2 text-xl font-bold">{game.category || "Miscellaneous"}</p>
            </div>
            <div className="rounded-xl bg-slate-950/70 p-4">
              <p className="text-sm text-gray-400">XP Reward</p>
              <p className="mt-2 text-xl font-bold text-cyan-400">+{game.xpReward || 0}</p>
            </div>
            <div className="rounded-xl bg-slate-950/70 p-4">
              <p className="text-sm text-gray-400">Coins</p>
              <p className="mt-2 text-xl font-bold text-yellow-400">+{game.coinsReward || 0}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-gray-300">{game.category || "Miscellaneous"}</span>
            {game.badge ? (
              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">Badge: {game.badge}</span>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="text-2xl font-bold text-cyan-400">Mission briefing</h2>
              <div className="mt-4 whitespace-pre-line text-gray-300">{game.instructions || "No formal briefing is provided for this challenge."}</div>
            </section>

            {Array.isArray(game.objectives) && game.objectives.length > 0 ? (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <h2 className="text-2xl font-bold text-cyan-400">Objectives</h2>
                <ul className="mt-4 space-y-3 text-gray-300">
                  {game.objectives.map((objective: string, index: number) => (
                    <li key={`${objective}-${index}`} className="ml-5 list-disc">{objective}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {Array.isArray(game.hints) && game.hints.length > 0 ? (
              <section className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6">
                <h2 className="text-xl font-semibold text-amber-300">Hints</h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-amber-100">
                  {game.hints.map((hint: string, index: number) => (
                    <li key={`${hint}-${index}`}>{hint}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <GameSubmission gameId={game._id.toString()} />
          </div>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-bold text-cyan-400">Leaderboard</h2>

            {leaderboard.length === 0 ? (
              <p className="mt-4 text-sm text-gray-400">No scores have been recorded yet.</p>
            ) : (
              <ul className="mt-5 space-y-3">
                {leaderboard.map((entry: any, index: number) => (
                  <li key={entry._id.toString()} className="flex items-center justify-between rounded-xl bg-slate-950/80 p-3">
                    <div>
                      <p className="text-sm text-gray-400">#{index + 1}</p>
                      <p className="font-medium text-white">{entry.userId?.name || entry.userId?.username || "Player"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-cyan-400">{entry.score}</p>
                      <p className="text-xs text-gray-400">{entry.attempts} attempts</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
