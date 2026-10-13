import Link from "next/link";

import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import CourseCard from "@/components/academy/CourseCard";

interface Props {
  searchParams?: {
    search?: string;
    category?: string;
    difficulty?: string;
    page?: string;
  };
}

export default async function AcademyPage({ searchParams }: Props) {
  await connectDB();

  const sp: any = (await (searchParams as any)) || {};

  const search = (sp.search || "").toString().trim();
  const category = sp.category || "";
  const difficulty = sp.difficulty || "";
  const page = Number(sp.page || "1");
  const limit = 12;

  const query: any = { published: true };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;

  const total = await Course.countDocuments(query);

  const courses = await Course.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-foreground">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Academy</h1>
            <p className="mt-1 text-sm text-slate-600">Browse curated, hands-on cybersecurity courses.</p>
          </div>

          <form method="get" className="flex gap-2">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search courses..."
              className="rounded-lg border border-border bg-card px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-2xs"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-2xs hover:bg-indigo-700 transition"
            >
              Search
            </button>
          </form>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
            <h3 className="text-base font-semibold text-slate-900">No courses found</h3>
            <p className="mt-1 text-sm text-slate-500">Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c: any) => (
              <CourseCard key={c._id} course={c} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link
              href={`/academy?search=${encodeURIComponent(search)}&page=${Math.max(1, page - 1)}`}
              className={`rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition ${page <= 1 ? 'opacity-40 pointer-events-none' : ''}`}
            >
              Previous
            </Link>

            <span className="text-sm font-medium text-slate-600">
              Page {page} of {totalPages}
            </span>

            <Link
              href={`/academy?search=${encodeURIComponent(search)}&page=${Math.min(totalPages, page + 1)}`}
              className={`rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition ${page >= totalPages ? 'opacity-40 pointer-events-none' : ''}`}
            >
              Next
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}