import Link from "next/link";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/server-auth";

import Course from "@/models/Course";

import CourseTable from "@/components/admin/courses/CourseTable";

export default async function AdminCoursesPage() {
  await connectDB();
  await requireAdmin();

  const courses = await Course.find({})
    .sort({ createdAt: -1 })
    .lean();

  const serializedCourses = courses.map((course: any) => ({
    ...course,
    _id: course._id.toString(),
  }));

  const totalCourses = serializedCourses.length;
  const publishedCourses = serializedCourses.filter(
    (course) => course.published
  ).length;
  const draftCourses = totalCourses - publishedCourses;

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400">
              Course Management
            </h1>

            <p className="mt-2 text-gray-400">
              Manage all cybersecurity courses.
            </p>
          </div>

          <Link
            href="/admin/courses/new"
            className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-black transition hover:bg-cyan-400"
          >
            + New Course
          </Link>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-cyan-500/20 bg-slate-900 p-6">
            <p className="text-sm text-gray-400">Total Courses</p>
            <h2 className="mt-2 text-3xl font-bold">{totalCourses}</h2>
          </div>

          <div className="rounded-xl border border-green-500/20 bg-slate-900 p-6">
            <p className="text-sm text-gray-400">Published</p>
            <h2 className="mt-2 text-3xl font-bold text-green-400">
              {publishedCourses}
            </h2>
          </div>

          <div className="rounded-xl border border-yellow-500/20 bg-slate-900 p-6">
            <p className="text-sm text-gray-400">Drafts</p>
            <h2 className="mt-2 text-3xl font-bold text-yellow-400">
              {draftCourses}
            </h2>
          </div>
        </div>

        <CourseTable courses={serializedCourses} />
      </div>
    </main>
  );
}