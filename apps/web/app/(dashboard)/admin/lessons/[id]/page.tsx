import { notFound } from "next/navigation";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/server-auth";

import Course from "@/models/Course";
import Lesson from "@/models/Lesson";

import LessonForm from "@/components/admin/lessons/LessonForm";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditLessonPage({ params }: Props) {
  await connectDB();

  await requireAdmin();

  const { id } = await params;

  const lesson = await Lesson.findById(id).lean();

  if (!lesson) {
    notFound();
  }

  const initialData = {
    _id: lesson._id.toString(),
    courseId: lesson.courseId.toString(),
    title: lesson.title,
    slug: lesson.slug,
    content: lesson.content,
    videoUrl: lesson.videoUrl || "",
    order: lesson.order ?? 1,
    duration: lesson.duration ?? 10,
    xpReward: lesson.xpReward ?? 50,
    published: lesson.published ?? true,
  };
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
            Edit Lesson
          </h1>

          <p className="mt-2 text-gray-400">
            Update lesson details.
          </p>
        </div>

        <LessonForm
          initialData={initialData}
          lessonId={id}
          courses={courses}
        />
      </div>
    </main>
  );
}
