import Link from "next/link";
import { notFound } from "next/navigation";

import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/current-user";

import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";

import LessonContent from "@/components/academy/LessonContent";
import LessonNavigation from "@/components/academy/LessonNavigation";
import MarkCompleteButton from "@/components/academy/MarkCompleteButton";

interface Props {
  params: Promise<{
    slug: string;
    lessonSlug: string;
  }>;
}

export default async function LessonPage({ params }: Props) {
  await connectDB();

  const { slug, lessonSlug } = await params;

  const course = await Course.findOne({
    slug,
    published: true,
  }).lean();

  if (!course) {
    notFound();
  }

  const lessons = await Lesson.find({
    courseId: course._id,
    published: true,
  })
    .sort({ order: 1 })
    .lean();

  const currentIndex = lessons.findIndex(
    (lesson) => lesson.slug === lessonSlug
  );

  if (currentIndex === -1) {
    notFound();
  }

  const lesson = lessons[currentIndex];
  const user = await getCurrentUser();
  const progress = user
    ? await Progress.findOne({ userId: user._id, courseId: course._id })
        .select("completedLessons")
        .lean()
    : null;
  const initialCompleted = Boolean(
    progress?.completedLessons?.includes(String(lesson._id))
  );

  const previousLesson =
    currentIndex > 0
      ? {
          slug: lessons[currentIndex - 1].slug,
          title: lessons[currentIndex - 1].title,
        }
      : null;

  const nextLesson =
    currentIndex < lessons.length - 1
      ? {
          slug: lessons[currentIndex + 1].slug,
          title: lessons[currentIndex + 1].title,
        }
      : null;

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-foreground">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/academy/${course.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-indigo-700 transition"
        >
          ← Back to {course.title}
        </Link>

        <div className="mt-6 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            {lesson.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
              ⏱ {lesson.duration} min
            </span>

            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-semibold text-amber-700">
              ⭐ {lesson.xpReward} XP
            </span>

            <span className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-primary">
              Lesson {currentIndex + 1} of {lessons.length}
            </span>
          </div>
        </div>

        <LessonContent
          content={lesson.content || ""}
          lessonTitle={lesson.title}
        />

        <div className="mt-8">
          <MarkCompleteButton
            courseId={String(course._id)}
            lessonId={String(lesson._id)}
            initialCompleted={initialCompleted}
          />
        </div>

        <LessonNavigation
          courseSlug={course.slug}
          previousLesson={previousLesson}
          nextLesson={nextLesson}
        />
      </div>
    </main>
  );
}