"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LessonContent from "@/components/academy/LessonContent";

interface Course {
  _id: string;
  title: string;
}

interface InitialData {
  _id?: string;
  courseId?: string;
  title?: string;
  slug?: string;
  content?: string;
  videoUrl?: string;
  order?: number;
  duration?: number;
  xpReward?: number;
  published?: boolean;
}

interface Props {
  initialData?: InitialData;
  lessonId?: string;
  courses: Course[];
}

export default function LessonForm({ initialData, lessonId, courses }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState<InitialData>({
    courseId: initialData?.courseId || "",
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    content: initialData?.content || "",
    videoUrl: initialData?.videoUrl || "",
    order: initialData?.order ?? 1,
    duration: initialData?.duration ?? 10,
    xpReward: initialData?.xpReward ?? 50,
    published: initialData?.published ?? false,
  });


  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);

      const method = lessonId ? "PATCH" : "POST";
      const payload = lessonId ? { ...form, lessonId } : form;

      const res = await fetch("/api/admin/lessons", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || `Failed to ${lessonId ? "update" : "create"} lesson.`);
        return;
      }

      setMessage(`Lesson ${lessonId ? "updated" : "created"} successfully.`);

      router.push("/admin/lessons");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "Unable to save lesson.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-cyan-500/20 bg-slate-900 p-8"
    >
      <div className="rounded bg-slate-800 p-3 text-sm text-cyan-300">Courses Loaded: {courses.length}</div>

      <div>
        <label className="mb-2 block">Course</label>

        <select
          required
          name="courseId"
          value={form.courseId}
          onChange={handleChange}
          className="w-full rounded-lg bg-slate-800 p-3"
        >
          <option value="">Select Course</option>

          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block">Lesson Title</label>

        <input required name="title" value={form.title} onChange={handleChange} className="w-full rounded-lg bg-slate-800 p-3" />
      </div>

      <div>
        <label className="mb-2 block">Slug</label>

        <input required name="slug" value={form.slug} onChange={handleChange} className="w-full rounded-lg bg-slate-800 p-3" />
      </div>

      <div>
        <label className="mb-2 block">Lesson Content</label>

        <textarea required rows={10} name="content" value={form.content} onChange={handleChange} className="w-full rounded-lg bg-slate-800 p-3" />
      </div>

      <div>
        <label className="mb-2 block">Video URL</label>

        <input name="videoUrl" value={form.videoUrl} onChange={handleChange} className="w-full rounded-lg bg-slate-800 p-3" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <label className="mb-2 block">Order</label>

          <input type="number" name="order" value={form.order as number} onChange={handleChange} className="w-full rounded-lg bg-slate-800 p-3" />
        </div>

        <div>
          <label className="mb-2 block">Duration (minutes)</label>

          <input type="number" name="duration" value={form.duration as number} onChange={handleChange} className="w-full rounded-lg bg-slate-800 p-3" />
        </div>

        <div>
          <label className="mb-2 block">XP Reward</label>

          <input type="number" name="xpReward" value={form.xpReward as number} onChange={handleChange} className="w-full rounded-lg bg-slate-800 p-3" />
        </div>
      </div>

      <label className="flex items-center gap-3">
        <input type="checkbox" name="published" checked={!!form.published} onChange={handleChange} />

        Published
      </label>

      <button
        type="button"
        onClick={() => setPreview((value) => !value)}
        className="rounded-lg border border-cyan-500/40 px-5 py-3 font-semibold text-cyan-200"
      >
        {preview ? "Hide learner preview" : "Preview learner view"}
      </button>

      {preview ? (
        <section aria-label="Learner preview">
          <p className="mb-3 text-xs uppercase tracking-widest text-cyan-400">Learner preview</p>
          <h2 className="mb-5 text-3xl font-bold">{form.title || "Lesson title"}</h2>
          <LessonContent content={form.content || ""} lessonTitle={form.title} />
        </section>
      ) : null}

      {message ? <p role="status" className="rounded-lg bg-slate-800 p-3 text-cyan-200">{message}</p> : null}

      <button type="submit" disabled={loading} className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? (lessonId ? "Updating..." : "Saving...") : lessonId ? "Update Lesson" : "Create Lesson"}
      </button>
    </form>
  );
}