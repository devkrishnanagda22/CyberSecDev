"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  lessonId: string;
  published: boolean;
}

export default function LessonActions({ lessonId, published }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function togglePublish() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/lessons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ lessonId, published: !published }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update lesson.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={togglePublish}
        disabled={loading}
        className={`rounded px-3 py-1 text-sm font-medium ${published ? "bg-yellow-500 text-black" : "bg-green-500 text-black"}`}
      >
        {loading ? "..." : published ? "Unpublish" : "Publish"}
      </button>

      <Link href={`/admin/lessons/${lessonId}`} className="text-cyan-400 hover:underline">
        Edit
      </Link>
    </div>
  );
}
