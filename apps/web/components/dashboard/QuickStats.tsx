"use client";

import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  BarChart3,
} from "lucide-react";

interface DashboardStats {
  enrolledCourses: number;
  completedCourses: number;
  lessonsCompleted: number;
  overallProgress: number;
}

interface QuickStatsProps {
  stats?: DashboardStats | null;
  loading?: boolean;
}

export default function QuickStats({
  stats,
  loading = false,
}: QuickStatsProps) {
  const safeStats: DashboardStats = stats ?? {
    enrolledCourses: 0,
    completedCourses: 0,
    lessonsCompleted: 0,
    overallProgress: 0,
  };

  const cards = [
    {
      title: "Enrolled Courses",
      value: safeStats.enrolledCourses,
      icon: BookOpen,
      iconBg: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Completed Courses",
      value: safeStats.completedCourses,
      icon: GraduationCap,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Lessons Completed",
      value: safeStats.lessonsCompleted,
      icon: CheckCircle2,
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      title: "Overall Progress",
      value: `${safeStats.overallProgress}%`,
      icon: BarChart3,
      iconBg: "bg-sky-50 text-sky-600",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-border bg-white p-6 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.title}
                </p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {loading ? "..." : card.value}
                </h2>
              </div>

              <div className={`inline-flex size-12 items-center justify-center rounded-xl ${card.iconBg}`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}