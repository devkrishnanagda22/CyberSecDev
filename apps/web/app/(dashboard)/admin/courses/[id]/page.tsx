import { notFound } from "next/navigation";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/server-auth";

import Course from "@/models/Course";

import CourseForm from "@/components/admin/courses/CourseForm";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connectDB();
  await requireAdmin();

  const { id } = await params;

  const course = await Course.findById(id).lean();

  if (!course) {
    notFound();
  }

  const serializedCourse = {
    _id: (course as any)._id.toString(),
    title: (course as any).title,
    slug: (course as any).slug,
    description: (course as any).description,
    category: (course as any).category,
    difficulty: (course as any).difficulty,
    xpReward: (course as any).xpReward,
    estimatedHours: (course as any).estimatedHours,
    published: (course as any).published,
    thumbnail: (course as any).thumbnail ?? "",
  };

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">
            Edit Course
          </h1>

          <p className="mt-2 text-gray-400">
            Update course information.
          </p>
        </div>

        <CourseForm
          mode="edit"
          initialData={serializedCourse}
        />
      </div>
    </main>
  );
}