"use client";

import { useState } from "react";
import LabInstructions from "@/components/labs/LabInstructions";

interface LabRecord {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  estimatedHours: number;
  instructions: string;
  hints: string[];
  category: string;
  xpReward: number;
  coinsReward: number;
  badge: string;
  tags: string[];
  published: boolean;
}

interface Props {
  initialLabs: LabRecord[];
}

const initialForm = {
  title: "",
  slug: "",
  description: "",
  difficulty: "Beginner",
  estimatedHours: 1,
  instructions: "",
  hints: "",
  category: "General",
  xpReward: 200,
  coinsReward: 25,
  badge: "",
  flag: "",
  tags: "",
  published: false,
};

export default function LabForm({ initialLabs }: Props) {
  const [labs, setLabs] = useState<LabRecord[]>(initialLabs);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [preview, setPreview] = useState(false);
  const [testFlag, setTestFlag] = useState("");

  async function loadLabs() {
    const res = await fetch("/api/admin/labs", {
      cache: "no-store",
      credentials: "same-origin",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Unable to load labs.");
    }
    setLabs(data.labs || []);
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setTestFlag("");
    setPreview(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    const { flag, ...formWithoutFlag } = form;
    const payload = {
      ...formWithoutFlag,
      ...(flag.trim() ? { flag: flag.trim() } : {}),
      estimatedHours: Number(form.estimatedHours) || 1,
      xpReward: Number(form.xpReward) || 0,
      coinsReward: Number(form.coinsReward) || 0,
      tags: form.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      hints: form.hints
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      published: Boolean(form.published),
    };

    try {
      const url = editingId ? `/api/admin/labs/${editingId}` : "/api/admin/labs";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to save lab.");
      }

      setMessage(data.message || "Lab saved successfully.");
      resetForm();
      await loadLabs();
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(lab: LabRecord) {
    setEditingId(lab._id || null);
    setForm({
      title: lab.title,
      slug: lab.slug,
      description: lab.description || "",
      difficulty: lab.difficulty || "Beginner",
      estimatedHours: lab.estimatedHours || 1,
      instructions: lab.instructions || "",
      hints: Array.isArray(lab.hints) ? lab.hints.join("\n") : "",
      category: lab.category || "General",
      xpReward: lab.xpReward || 200,
      coinsReward: lab.coinsReward || 25,
      badge: lab.badge || "",
      flag: "",
      tags: Array.isArray(lab.tags) ? lab.tags.join(", ") : "",
      published: Boolean(lab.published),
    });
    setPreview(false);
    setTestFlag("");
  }

  async function testChallengeConfiguration() {
    if (!editingId || !testFlag.trim()) return;

    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const res = await fetch(`/api/admin/labs/${editingId}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ flag: testFlag }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to test configuration.");
      setIsError(!data.valid);
      setMessage(data.message);
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Unable to test configuration.");
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(lab: LabRecord) {
    if (!lab._id) return;

    try {
      const res = await fetch(`/api/admin/labs/${lab._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ published: !lab.published }),
      });

      if (!res.ok) {
        throw new Error("Unable to update publish state.");
      }

      await loadLabs();
      setMessage("Publish state updated.");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "Update failed.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-white">Lab CMS</h2>
            <p className="mt-2 text-sm text-gray-400">
              Create, edit, preview, and publish cybersecurity labs from one place.
            </p>
          </div>
          <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
            {labs.length} labs
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-gray-300">
              <span className="mb-2 block">Title</span>
              <input
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </label>

            <label className="text-sm text-gray-300">
              <span className="mb-2 block">Slug</span>
              <input
                required
                value={form.slug}
                onChange={(event) => setForm({ ...form, slug: event.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </label>
          </div>

          <label className="block text-sm text-gray-300">
            <span className="mb-2 block">Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm text-gray-300">
              <span className="mb-2 block">Difficulty</span>
              <select
                value={form.difficulty}
                onChange={(event) => setForm({ ...form, difficulty: event.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </label>

            <label className="text-sm text-gray-300">
              <span className="mb-2 block">Estimated Hours</span>
              <input
                type="number"
                min="1"
                value={form.estimatedHours}
                onChange={(event) => setForm({ ...form, estimatedHours: Number(event.target.value) })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </label>

            <label className="text-sm text-gray-300">
              <span className="mb-2 block">Category</span>
              <input
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </label>
          </div>

          <label className="block text-sm text-gray-300">
            <span className="mb-2 block">Instructions</span>
            <textarea
              rows={8}
              value={form.instructions}
              onChange={(event) => setForm({ ...form, instructions: event.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              placeholder="Use markdown-style headings, bullets, and code blocks."
            />
          </label>

          <label className="block text-sm text-gray-300">
            <span className="mb-2 block">Hints</span>
            <textarea
              rows={4}
              value={form.hints}
              onChange={(event) => setForm({ ...form, hints: event.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              placeholder="One hint per line"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm text-gray-300">
              <span className="mb-2 block">XP Reward</span>
              <input
                type="number"
                min="0"
                value={form.xpReward}
                onChange={(event) => setForm({ ...form, xpReward: Number(event.target.value) })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </label>

            <label className="text-sm text-gray-300">
              <span className="mb-2 block">Coins Reward</span>
              <input
                type="number"
                min="0"
                value={form.coinsReward}
                onChange={(event) => setForm({ ...form, coinsReward: Number(event.target.value) })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </label>

            <label className="text-sm text-gray-300">
              <span className="mb-2 block">Badge</span>
              <input
                value={form.badge}
                onChange={(event) => setForm({ ...form, badge: event.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-gray-300">
              <span className="mb-2 block">Flag</span>
              <input
                required={!editingId}
                value={form.flag}
                onChange={(event) => setForm({ ...form, flag: event.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                placeholder={editingId ? "Leave blank to keep the current flag" : "FLAG{...}"}
              />
            </label>

            <label className="text-sm text-gray-300">
              <span className="mb-2 block">Tags</span>
              <input
                value={form.tags}
                onChange={(event) => setForm({ ...form, tags: event.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                placeholder="web, sql, linux"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(event) => setForm({ ...form, published: event.target.checked })}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950"
            />
            Publish immediately
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {loading ? "Saving..." : editingId ? "Update Lab" : "Create Lab"}
            </button>
            <button
              type="button"
              onClick={() => setPreview((value) => !value)}
              className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-gray-200 transition hover:border-cyan-400"
            >
              {preview ? "Hide preview" : "Preview learner view"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-gray-200 transition hover:border-cyan-400"
              >
                Cancel
              </button>
            )}
          </div>
          {editingId && (
            <div className="grid gap-3 rounded-xl border border-amber-500/20 bg-slate-950 p-4 md:grid-cols-[1fr_auto]">
              <input
                type="password"
                autoComplete="off"
                value={testFlag}
                onChange={(event) => setTestFlag(event.target.value)}
                placeholder="Enter a candidate flag to test (not logged or rewarded)"
                className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-amber-400"
              />
              <button
                type="button"
                disabled={loading || !testFlag.trim()}
                onClick={() => void testChallengeConfiguration()}
                className="rounded-lg border border-amber-500/40 px-4 py-3 text-amber-200 disabled:opacity-50"
              >
                Test saved flag
              </button>
            </div>
          )}
        </form>

        {preview ? (
          <section className="mt-8 rounded-2xl border border-cyan-500/20 bg-slate-950 p-6" aria-label="Learner preview">
            <p className="text-xs uppercase tracking-widest text-cyan-400">Learner preview</p>
            <h2 className="mt-3 text-3xl font-bold">{form.title || "Challenge title"}</h2>
            <p className="mt-3 text-gray-300">{form.description || "Challenge description"}</p>
            <p className="mt-3 text-sm text-gray-400">{form.category} · {form.difficulty} · {form.estimatedHours} hr</p>
            <div className="mt-5">
              <LabInstructions instructions={form.instructions} />
            </div>
            {form.hints.trim() ? (
              <div className="mt-5 rounded-xl border border-amber-500/20 p-4">
                <h3 className="font-semibold text-amber-200">Hints</h3>
                <ul className="mt-2 list-inside list-disc text-amber-100">
                  {form.hints.split("\n").map((hint, index) => hint.trim() ? <li key={index}>{hint.trim()}</li> : null)}
                </ul>
              </div>
            ) : null}
            <p className="mt-5 text-sm text-gray-500">Flag submission is unavailable in preview. No rewards can be earned here.</p>
          </section>
        ) : null}

        {message ? (
          <div className={`mt-5 rounded-lg p-4 ${isError ? "bg-red-900/40 text-red-300" : "bg-green-900/40 text-green-300"}`}>
            {message}
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        {labs.map((lab) => (
          <div key={lab._id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-white">{lab.title}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${lab.published ? "bg-green-500/15 text-green-300" : "bg-amber-500/15 text-amber-300"}`}>
                    {lab.published ? "Published" : "Draft"}
                  </span>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-gray-400">{lab.difficulty}</span>
                </div>
                <p className="mt-3 max-w-3xl text-sm text-gray-400">{lab.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-400">
                  <span className="rounded-full bg-slate-800 px-3 py-1">{lab.category}</span>
                  {lab.tags?.slice(0, 4).map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-800 px-3 py-1">#{tag}</span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => togglePublish(lab)}
                  className="rounded-lg border border-cyan-500/30 px-4 py-2 text-sm text-cyan-300 transition hover:border-cyan-400"
                >
                  {lab.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(lab)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-gray-200 transition hover:border-cyan-400"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
