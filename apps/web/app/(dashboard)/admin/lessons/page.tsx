import Link from "next/link";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/server-auth";

await import("@/models/Course");
const { default: Lesson } = await import("@/models/Lesson");
import LessonActions from "@/components/admin/lessons/LessonActions";
import AdminLessonsTable from "@/components/admin/lessons/AdminLessonsTable";

export default async function AdminLessonsPage() {
  await connectDB();
  await requireAdmin();

  const lessons = await Lesson.find({})
    .populate("courseId", "title")
    .sort({
      createdAt: -1,
    })
    .lean();

  const totalLessons = lessons.length;

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-4xl font-bold text-cyan-400">
              Lesson Management
            </h1>

            <p className="mt-2 text-gray-400">
              Manage all lessons across every course.
            </p>
          </div>

          <Link
            href="/admin/lessons/new"
            className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-black hover:bg-cyan-400"
          >
            + New Lesson
          </Link>

        </div>

        <div className="mb-8 rounded-xl border border-cyan-500/20 bg-slate-900 p-6">

          <p className="text-gray-400">
            Total Lessons
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {totalLessons}
          </h2>

        </div>

        <div className="mb-6">
          <AdminLessonsTable />
        </div>

      </div>
    </main>
  );
}