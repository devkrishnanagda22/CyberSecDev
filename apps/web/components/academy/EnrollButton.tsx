"use client";

import { useState } from "react";

export default function EnrollButton({ courseId, initialEnrolled = false }: { courseId: string; initialEnrolled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(initialEnrolled);

  async function handleEnroll() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/academy/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ courseId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to enroll.");
        return;
      }

      setEnrolled(true);
      alert("Enrolled successfully.");
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  if (enrolled) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-2xs cursor-default"
      >
        Enrolled
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleEnroll}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-2xs hover:bg-indigo-700 transition disabled:opacity-60"
    >
      {loading ? "Enrolling..." : "Enroll"}
    </button>
  );
}
