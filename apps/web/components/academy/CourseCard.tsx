import Link from "next/link";
import { Clock, Award } from "lucide-react";

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  xpReward: number;
  estimatedHours: number;
}

export default function CourseCard({
  course,
}: {
  course: Course;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-primary">
            {course.category}
          </span>
          {course.difficulty && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">
              {course.difficulty}
            </span>
          )}
        </div>

        <h2 className="mt-4 text-xl font-bold text-slate-900 leading-snug">
          {course.title}
        </h2>

        <p className="mt-2.5 text-sm text-slate-600 line-clamp-3 leading-relaxed">
          {course.description}
        </p>
      </div>

      <div>
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5 text-amber-600">
            <Award size={16} />
            <span className="font-semibold text-slate-700">{course.xpReward} XP</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock size={16} />
            <span>{course.estimatedHours} hrs</span>
          </div>
        </div>

        <Link
          href={`/academy/${course.slug}`}
          className="mt-5 block w-full rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-xs transition hover:bg-indigo-700"
        >
          Start Learning
        </Link>
      </div>
    </div>
  );
}