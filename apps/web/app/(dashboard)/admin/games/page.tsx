import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/server-auth";
import Game from "@/models/Game";

export default async function AdminGamesPage() {
  await connectDB();

  await requireAdmin();

  const games = await Game.find({}).sort({ createdAt: -1 }).lean();

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-cyan-400">Game Management</h1>
        <p className="mt-3 text-gray-400">Manage cybersecurity games and leaderboards.</p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <table className="min-w-full divide-y divide-slate-800 text-left">
            <thead className="bg-slate-900 text-sm uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Rewards</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {games.map((game) => (
                <tr key={game._id.toString()} className="text-sm text-gray-200">
                  <td className="px-6 py-4 font-medium text-white">{game.title}</td>
                  <td className="px-6 py-4">{game.difficulty}</td>
                  <td className="px-6 py-4">{game.xpReward} XP / {game.coinsReward} Coins</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs ${game.published ? "bg-green-500/15 text-green-300" : "bg-amber-500/15 text-amber-300"}`}>
                      {game.published ? "Published" : "Draft"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
