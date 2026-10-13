"use client";

import Link from "next/link";

interface Course {
  _id: string;
  title: string;
  category: string;
  difficulty: string;
  xpReward: number;
  estimatedHours: number;
  published: boolean;
}

export default function CourseTable({
  courses,
}: {
  courses: Course[];
}) {
  if (courses.length === 0) {
    return (
      <div className="rounded-xl border border-cyan-500/20 bg-slate-900 p-10 text-center text-gray-400">
        No courses found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-cyan-500/20 bg-slate-900">
      <table className="min-w-full">
        <thead className="border-b border-cyan-500/20 bg-slate-800">
          <tr>
            <th className="px-6 py-4 text-left">Title</th>
            <th className="px-6 py-4 text-left">Category</th>
            <th className="px-6 py-4 text-left">Difficulty</th>
            <th className="px-6 py-4 text-left">XP</th>
            <th className="px-6 py-4 text-left">Hours</th>
            <th className="px-6 py-4 text-left">Status</th>
            <th className="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {courses.map((course) => (
            <tr
              key={course._id}
              className="border-b border-slate-800 hover:bg-slate-800/40"
            >
              <td className="px-6 py-4">{course.title}</td>
              <td className="px-6 py-4">{course.category}</td>
              <td className="px-6 py-4">{course.difficulty}</td>
              <td className="px-6 py-4">{course.xpReward}</td>
              <td className="px-6 py-4">
                {course.estimatedHours}h
              </td>
              <td className="px-6 py-4">
                {course.published ? "Published" : "Draft"}
              </td>

              <td className="px-6 py-4">
                <div className="flex justify-center gap-2">
                  <Link
                    href={`/admin/courses/${course._id}`}
                    className="rounded bg-cyan-600 px-3 py-1 text-sm hover:bg-cyan-500"
                  >
                    Edit
                  </Link>

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}