"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Course {
  _id: string;
  title: string;
}

interface Lesson {
  _id: string;
  title: string;
  slug: string;
  order: number;
  duration: number;
  xpReward: number;
  published: boolean;
  courseId: {
    _id: string;
    title: string;
  };
}

export default function LessonTable() {
  const [loading, setLoading] = useState(true);

  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [courses, setCourses] = useState<Course[]>([]);

  const [search, setSearch] = useState("");

  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [search, selectedCourse]);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/admin/courses");

      const data = await res.json();

      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchLessons() {
    try {
      setLoading(true);

      let url = "/api/admin/lessons?";

      if (search) {
        url += `search=${encodeURIComponent(search)}&`;
      }

      if (selectedCourse) {
        url += `course=${selectedCourse}&`;
      }

      const res = await fetch(url);

      const data = await res.json();

      if (data.success) {
        setLessons(data.lessons);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-slate-900 p-6">

      <div className="mb-6 flex flex-col gap-4 md:flex-row">

        <input
          type="text"
          placeholder="Search lesson..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg bg-slate-800 p-3 outline-none"
        />

        <select
          value={selectedCourse}
          onChange={(e) =>
            setSelectedCourse(e.target.value)
          }
          className="rounded-lg bg-slate-800 p-3"
        >
          <option value="">All Courses</option>

          {courses.map((course) => (
            <option
              key={course._id}
              value={course._id}
            >
              {course.title}
            </option>
          ))}
        </select>

      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400">
          Loading lessons...
        </div>
      ) : lessons.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          No lessons found.
        </div>
      ) : (
        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-slate-700 text-left">

                <th className="p-4">Course</th>

                <th className="p-4">Lesson</th>

                <th className="p-4">Slug</th>

                <th className="p-4">Order</th>

                <th className="p-4">Duration</th>

                <th className="p-4">XP</th>

                <th className="p-4">Status</th>

                <th className="p-4">Actions</th>

              </tr>

            </thead>

            <tbody>

              {lessons.map((lesson) => (

                <tr
                  key={lesson._id}
                  className="border-b border-slate-800 hover:bg-slate-800/40"
                >

                  <td className="p-4">
                    {lesson.courseId?.title}
                  </td>

                  <td className="p-4 font-medium">
                    {lesson.title}
                  </td>

                  <td className="p-4 text-gray-400">
                    {lesson.slug}
                  </td>

                  <td className="p-4">
                    {lesson.order}
                  </td>

                  <td className="p-4">
                    {lesson.duration} min
                  </td>

                  <td className="p-4">
                    {lesson.xpReward}
                  </td>

                  <td className="p-4">

                    {lesson.published ? (

                      <span className="rounded bg-green-500/20 px-3 py-1 text-sm text-green-400">
                        Published
                      </span>

                    ) : (

                      <span className="rounded bg-red-500/20 px-3 py-1 text-sm text-red-400">
                        Draft
                      </span>

                    )}

                  </td>

                  <td className="p-4">

                    <div className="flex gap-3">

                      <Link
                        href={`/admin/lessons/${lesson._id}`}
                        className="rounded bg-cyan-500 px-3 py-1 text-black hover:bg-cyan-400"
                      >
                        Edit
                      </Link>

                      <button
                        className="rounded bg-red-600 px-3 py-1 hover:bg-red-500"
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}