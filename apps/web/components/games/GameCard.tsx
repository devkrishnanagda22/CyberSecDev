import Link from "next/link";

export default function GameCard({ game }: { game: any }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900 leading-snug">{game.title}</h3>
          <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {game.category || "General"}
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">{game.description}</p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-600">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 capitalize">{game.difficulty || "Beginner"}</span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-700">+{game.xpReward || 0} XP</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5">+{game.coinsReward || 0} Coins</span>
        </div>

        <Link
          href={`/games/${game.slug}`}
          className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-2xs hover:bg-indigo-700 transition shrink-0"
        >
          Play
        </Link>
      </div>
    </div>
  );
}
