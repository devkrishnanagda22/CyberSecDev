import { connectDB } from "@/lib/mongodb";
import Lab from "@/models/Lab";
import LabCard from "@/components/labs/LabCard";

interface LabsPageProps {
  searchParams: Promise<{
    search?: string;
    difficulty?: string;
  }>;
}

export default async function LabsPage({ searchParams }: LabsPageProps) {
  await connectDB();

  const resolvedParams = await searchParams;
  const search = typeof resolvedParams?.search === "string" ? resolvedParams.search : "";
  const difficulty = typeof resolvedParams?.difficulty === "string" ? resolvedParams.difficulty : "all";

  const query: Record<string, unknown> = {
    published: true,
  };

  if (search.trim()) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } },
    ];
  }

  if (difficulty !== "all") {
    query.difficulty = difficulty;
  }

  const labs = await Lab.find(query)
    .select("-flag")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-foreground">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Hands-on practice</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Cyber Labs</h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Solve guided scenarios, submit flags, earn XP, and sharpen your offensive and defensive skills.
            </p>
          </div>

          <form method="get" action="/labs" className="flex flex-wrap items-center gap-2.5">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search labs..."
              className="rounded-lg border border-border bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs"
            />
            <select
              name="difficulty"
              defaultValue={difficulty}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs"
            >
              <option value="all">All difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-2xs hover:bg-indigo-700 transition"
            >
              Filter
            </button>
          </form>
        </div>

        {labs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-slate-500 shadow-xs">
            No labs match your current filters.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {labs.map((lab) => (
              <LabCard
                key={lab._id.toString()}
                lab={lab}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}