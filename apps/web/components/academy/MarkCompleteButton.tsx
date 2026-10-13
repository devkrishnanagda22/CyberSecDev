"use client";

import { useState } from "react";

export default function MarkCompleteButton({ courseId, lessonId, initialCompleted = false }: { courseId: string; lessonId: string; initialCompleted?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(initialCompleted);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function handleMark() {
    if (loading || completed) return;
    setLoading(true);
    setMessage("");
    setError(false);

    try {
      const res = await fetch("/api/academy/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ courseId, lessonId }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(true);
        setMessage(data?.message || "Failed to save lesson completion.");
        return;
      }

      setCompleted(true);
      setMessage(
        data?.alreadyCompleted
          ? "This lesson was already completed. No additional reward was added."
          : `Lesson completed. ${Number(data?.awardedXP) || 0} XP awarded.`
      );
    } catch (error) {
      console.error(error);
      setError(true);
      setMessage("Unable to save lesson completion. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (completed) {
    return (
      <div>
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-2xs cursor-default"
        >
          Completed
        </button>
        {message ? (
          <p role="status" className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
            {message}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleMark}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-2xs hover:bg-amber-600 transition disabled:opacity-60"
      >
        {loading ? "Saving..." : "Mark Complete"}
      </button>
      {message ? (
        <p
          role={error ? "alert" : "status"}
          className={`mt-3 rounded-lg p-3 text-sm font-medium ${
            error
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
