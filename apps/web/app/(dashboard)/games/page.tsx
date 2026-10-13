import { connectDB } from "@/lib/mongodb";
import Game from "@/models/Game";
import GameCard from "@/components/games/GameCard";

export default async function GamesPage() {
  await connectDB();

  const games = await Game.find({ published: true }).sort({ createdAt: -1 }).lean();

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-foreground">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Challenge arena</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Cyber Games</h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Practice your offensive and defensive instincts with short, reward-backed security challenges.
          </p>
        </div>

        {games.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-slate-500 shadow-xs">
            No published games are available right now. Check back soon.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {games.map((game: any) => (
              <GameCard key={game._id.toString()} game={game} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
