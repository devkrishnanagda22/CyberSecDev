"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CourseFormProps {
  mode?: "create" | "edit";
  initialData?: {
    _id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    difficulty: string;
    xpReward: number;
    estimatedHours: number;
    published: boolean;
    thumbnail?: string;
  };
}

export default function CourseForm({
  mode = "create",
  initialData,
}: CourseFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    category: initialData?.category ?? "",
    difficulty: initialData?.difficulty ?? "Beginner",
    xpReward: initialData?.xpReward ?? 100,
    estimatedHours: initialData?.estimatedHours ?? 2,
    published: initialData?.published ?? false,
    thumbnail: initialData?.thumbnail ?? "",
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

    try {
      setLoading(true);

      const url =
        mode === "create"
          ? "/api/admin/courses"
          : `/api/admin/courses/${initialData?._id}`;

      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Something went wrong.");
        return;
      }

      alert(
        mode === "create"
          ? "✅ Course created successfully!"
          : "✅ Course updated successfully!"
      );

      router.push("/admin/courses");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-cyan-500/20 bg-slate-900 p-8"
    >
      <div>
        <label className="mb-2 block">Course Title</label>

        <input
          required
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full rounded-lg bg-slate-800 p-3"
        />
      </div>

      <div>
        <label className="mb-2 block">Slug</label>

        <input
          required
          name="slug"
          value={form.slug}
          onChange={handleChange}
          className="w-full rounded-lg bg-slate-800 p-3"
        />
      </div>

      <div>
        <label className="mb-2 block">Description</label>

        <textarea
          required
          rows={5}
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full rounded-lg bg-slate-800 p-3"
        />
      </div>

      <div>
        <label className="mb-2 block">Category</label>

        <input
          required
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full rounded-lg bg-slate-800 p-3"
        />
      </div>

      <div>
        <label className="mb-2 block">Difficulty</label>

        <select
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}
          className="w-full rounded-lg bg-slate-800 p-3"
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block">XP Reward</label>

        <input
          type="number"
          name="xpReward"
          value={form.xpReward}
          onChange={handleChange}
          className="w-full rounded-lg bg-slate-800 p-3"
        />
      </div>

      <div>
        <label className="mb-2 block">Estimated Hours</label>

        <input
          type="number"
          name="estimatedHours"
          value={form.estimatedHours}
          onChange={handleChange}
          className="w-full rounded-lg bg-slate-800 p-3"
        />
      </div>

      <div>
        <label className="mb-2 block">Thumbnail URL</label>

        <input
          name="thumbnail"
          value={form.thumbnail}
          onChange={handleChange}
          className="w-full rounded-lg bg-slate-800 p-3"
          placeholder="https://example.com/image.png"
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="published"
          checked={form.published}
          onChange={handleChange}
        />

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
        <section className="rounded-xl border border-cyan-500/20 bg-slate-950 p-6" aria-label="Learner preview">
          <p className="text-xs uppercase tracking-widest text-cyan-400">Learner preview</p>
          <h2 className="mt-3 text-3xl font-bold">{form.title || "Course title"}</h2>
          <p className="mt-3 text-gray-300">{form.description || "Course summary"}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-300">{form.category || "Category"}</span>
            <span className="rounded-full bg-slate-800 px-3 py-1">{form.difficulty}</span>
            <span className="rounded-full bg-slate-800 px-3 py-1">{form.estimatedHours} hrs</span>
            <span className="rounded-full bg-slate-800 px-3 py-1">{form.xpReward} XP</span>
          </div>
          <p className="mt-5 text-sm text-gray-500">Course lessons will appear here after they are published.</p>
        </section>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? mode === "create"
            ? "Creating..."
            : "Saving..."
          : mode === "create"
          ? "Create Course"
          : "Save Changes"}
      </button>
    </form>
  );
}