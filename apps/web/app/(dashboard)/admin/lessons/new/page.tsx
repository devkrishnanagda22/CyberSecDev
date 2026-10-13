import { requireAdmin } from "@/lib/server-auth";

import LessonForm from "@/components/admin/lessons/LessonForm";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

export default async function NewLessonPage() {
  await requireAdmin();
  await connectDB();
  const courseRecords = await Course.find({}).select("title").sort({ title: 1 }).lean();
  const courses = courseRecords.map((course) => ({
    _id: course._id.toString(),
    title: course.title,
  }));

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">
            Create New Lesson
          </h1>

          <p className="mt-2 text-gray-400">
            Add a new lesson to a cybersecurity course.
          </p>
        </div>

        <LessonForm courses={courses} />
      </div>
    </main>
  );
}