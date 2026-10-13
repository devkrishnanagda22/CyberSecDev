"use client";

import Link from "next/link";

interface LessonNavigationProps {
  courseSlug: string;
  previousLesson?: {
    slug: string;
    title: string;
  } | null;
  nextLesson?: {
    slug: string;
    title: string;
  } | null;
}

export default function LessonNavigation({
  courseSlug,
  previousLesson,
  nextLesson,
}: LessonNavigationProps) {
  return (
    <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-between">
      <div className="flex-1">
        {previousLesson ? (
          <Link
            href={`/academy/${courseSlug}/lesson/${previousLesson.slug}`}
            className="block rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-slate-300 hover:bg-slate-50/80"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              ← Previous Lesson
            </div>

            <div className="mt-1 text-sm font-semibold text-slate-900">
              {previousLesson.title}
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>

      <div className="flex-1">
        {nextLesson ? (
          <Link
            href={`/academy/${courseSlug}/lesson/${nextLesson.slug}`}
            className="block rounded-2xl border border-border bg-card p-5 text-left sm:text-right shadow-xs transition hover:border-slate-300 hover:bg-slate-50/80"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Next Lesson →
            </div>

            <div className="mt-1 text-sm font-semibold text-slate-900">
              {nextLesson.title}
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}