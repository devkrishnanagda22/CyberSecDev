"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LessonActions from "./LessonActions";

interface Lesson {
  _id: string;
  title: string;
  courseId?: { _id: string; title: string } | string;
  order?: number;
  duration?: number;
  xpReward?: number;
  published?: boolean;
}

export default function AdminLessonsTable() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, [page]);

  async function fetchLessons(q?: string) {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (q !== undefined) params.set("search", q);

      const res = await fetch(`/api/admin/lessons?${params.toString()}`, { cache: "no-store", credentials: "same-origin" });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to load lessons.");
        return;
      }

      setLessons(data.lessons || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error(error);
      alert("Unable to fetch lessons.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchLessons(search);
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons"
            className="rounded-lg bg-slate-800 p-2"
          />

          <button className="rounded bg-cyan-500 px-3 py-1">Search</button>
        </form>

        <Link href="/admin/lessons/new" className="ml-auto rounded bg-cyan-500 px-4 py-2 text-black">
          + New Lesson
        </Link>
      </div>

      <div className="rounded-xl border border-cyan-500/20 bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : lessons.length === 0 ? (
          <div className="p-6 text-center">No lessons found.</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left">Title</th>
                <th className="px-6 py-4 text-left">Course</th>
                <th className="px-6 py-4 text-left">Order</th>
                <th className="px-6 py-4 text-left">Duration</th>
                <th className="px-6 py-4 text-left">XP</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson._id} className="border-t border-slate-800">
                  <td className="px-6 py-4">{lesson.title}</td>
                  <td className="px-6 py-4">{(lesson.courseId as any)?.title ?? "-"}</td>
                  <td className="px-6 py-4">{lesson.order}</td>
                  <td className="px-6 py-4">{lesson.duration} min</td>
                  <td className="px-6 py-4">{lesson.xpReward}</td>
                  <td className="px-6 py-4">
                    {lesson.published ? (
                      <span className="rounded bg-green-500/20 px-3 py-1 text-green-400">Published</span>
                    ) : (
                      <span className="rounded bg-yellow-500/20 px-3 py-1 text-yellow-400">Draft</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <LessonActions lessonId={lesson._id} published={!!lesson.published} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded bg-slate-800 px-3 py-1">
          Prev
        </button>

        <div className="px-3">Page {page} / {totalPages}</div>

        <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded bg-slate-800 px-3 py-1">
          Next
        </button>
      </div>
    </div>
  );
}
