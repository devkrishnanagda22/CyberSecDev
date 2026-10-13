"use client";

import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";

interface ContinueLearningItem {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  progress: number;
  completed: boolean;
  continueHref: string;
}

interface ContinueLearningProps {
  courses?: ContinueLearningItem[];
  loading?: boolean;
}

export default function ContinueLearning({
  courses = [],
  loading = false,
}: ContinueLearningProps) {
  if (loading) {
    return (
      <section className="mt-10">
        <h2 className="text-2xl font-bold">Continue Learning</h2>
        <div className="mt-6 text-gray-400">Loading courses...</div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-primary">
          {courses.length} Active Courses
        </span>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-xs">
          <p className="text-sm text-slate-600">You haven&apos;t enrolled in any courses yet.</p>
          <Link
            href="/academy"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs transition hover:bg-indigo-700"
          >
            Explore Academy
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course._id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-white p-6 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="inline-flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-primary">
                    <BookOpen size={20} />
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      course.completed
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    {course.completed
                      ? "Completed"
                      : `${Math.max(0, Math.min(course.progress ?? 0, 100))}% Complete`}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{course.title}</h3>

                <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-primary transition-all duration-300"
                    style={{
                      width: `${Math.max(0, Math.min(course.progress ?? 0, 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={14} />
                  <span>{Math.max(0, Math.min(course.progress ?? 0, 100))}%</span>
                </div>

                <Link
                  href={course.continueHref || (course.slug ? `/academy/${course.slug}` : "/academy")}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-2xs transition ${
                    course.completed
                      ? "border border-border bg-white text-slate-700 hover:bg-slate-50"
                      : "bg-primary text-primary-foreground hover:bg-indigo-700"
                  }`}
                >
                  {course.completed ? "Review Course" : "Continue Lesson"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}