import Link from "next/link";
import { notFound } from "next/navigation";

import { connectDB } from "@/lib/mongodb";
import { summarizeCourseProgress } from "@/lib/academy-progress";
import { getCurrentUser } from "@/lib/current-user";

import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";

import EnrollButton from "@/components/academy/EnrollButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params;

  await connectDB();

  const course = await Course.findOne({ slug, published: true }).lean();

  if (!course) notFound();

  const lessons = await Lesson.find({ courseId: course._id, published: true })
    .sort({ order: 1 })
    .lean();

  const related = await Course.find({ category: course.category, _id: { $ne: course._id }, published: true }).limit(3).lean();

  const user = await getCurrentUser();

  let progressRecord = null;

  if (user) {
    progressRecord = await Progress.findOne({ userId: user._id, courseId: course._id }).lean();
  }

  const completedLessonIds = new Set(progressRecord?.completedLessons ?? []);
  const progressSummary = summarizeCourseProgress(
    lessons.map((lesson) => String(lesson._id)),
    [...completedLessonIds].map(String)
  );
  const completedLessons = progressSummary.completedCount;
  const totalLessons = lessons.length;
  const percent = progressSummary.progress;

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-foreground">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">{course.title}</h1>
              <p className="mt-2 text-base text-slate-600 leading-relaxed">{course.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs">
                <span className="rounded-full bg-indigo-50 px-3 py-1 font-semibold text-primary">{course.category}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600 capitalize">{course.difficulty}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">{course.estimatedHours} hrs</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700 border border-amber-200">{course.xpReward} XP</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start gap-3 shrink-0">
              <Link
                href="#lessons"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
              >
                View Lessons
              </Link>

              <EnrollButton courseId={course._id.toString()} initialEnrolled={!!progressRecord} />
            </div>
          </div>
        </div>

        {progressSummary.completed ? (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800 shadow-xs">
            <p className="text-sm font-semibold">Course completed. You can revisit any lesson below.</p>
            <Link
              href="/academy"
              className="rounded-lg border border-emerald-300 bg-white px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs transition hover:bg-emerald-50"
            >
              Return to Academy
            </Link>
          </div>
        ) : null}

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h3 className="text-xl font-bold text-slate-900">Course Content</h3>

              <div id="lessons" className="mt-5">
                {lessons.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">No lessons published yet.</div>
                ) : (
                  <ol className="space-y-3">
                    {lessons.map((lesson, idx) => {
                      const lessonCompleted = completedLessonIds.has(String(lesson._id));

                      return (
                        <li
                          key={lesson._id.toString()}
                          className="flex items-center justify-between gap-4 rounded-xl border border-border bg-slate-50/70 p-4 transition hover:bg-slate-100/70"
                        >
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {idx + 1}. {lesson.title}
                            </div>
                            <div className="mt-0.5 text-xs text-slate-500">
                              {lesson.duration} min • {lesson.xpReward} XP
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            {lessonCompleted ? (
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                Completed
                              </span>
                            ) : null}
                            <Link
                              href={`/academy/${course.slug}/lesson/${lesson.slug}`}
                              className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-2xs hover:bg-indigo-700 transition"
                            >
                              {lessonCompleted ? "Review" : "Open"}
                            </Link>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h4 className="text-base font-bold text-slate-900">Progress</h4>
              <div className="mt-3">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>{completedLessons} / {totalLessons} lessons</span>
                  <span>{percent}%</span>
                </div>
                <div className="mt-2 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${percent}%` }} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h4 className="text-base font-bold text-slate-900">Related Courses</h4>
              <div className="mt-3 space-y-2.5">
                {related.map((relatedCourse) => (
                  <Link
                    key={relatedCourse._id.toString()}
                    href={`/academy/${relatedCourse.slug}`}
                    className="block rounded-lg border border-border bg-slate-50/70 p-3 text-sm font-medium text-slate-800 hover:text-primary hover:border-slate-300 transition"
                  >
                    {relatedCourse.title}
                  </Link>
                ))}
                {related.length === 0 && <div className="text-xs text-slate-500">No related courses.</div>}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}