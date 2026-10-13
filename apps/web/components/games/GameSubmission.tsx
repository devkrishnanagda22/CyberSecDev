"use client";

import { FormEvent, useState } from "react";

interface GameSubmissionProps {
  gameId: string;
}

export default function GameSubmission({ gameId }: GameSubmissionProps) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading || !answer.trim()) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/games/${gameId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ answer }),
      });

      const data = await response.json();

      setSuccess(response.ok && data.success);
      setMessage(
        data.message || (response.ok ? "Submission received." : "Submission failed.")
      );

      if (response.ok && data.success && data.xp !== undefined) {
        setAnswer("");
      }
    } catch (error) {
      console.error("Game submission failed:", error);
      setSuccess(false);
      setMessage("Something went wrong while checking your answer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-6">
      <h2 className="mb-4 text-2xl font-bold text-cyan-400">Submit answer</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Enter the challenge answer"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
        />

        <button
          type="submit"
          disabled={loading || !answer.trim()}
          className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Checking..." : "Submit answer"}
        </button>
      </form>

      {message ? (
        <div
          className={`mt-5 rounded-lg p-4 ${
            success ? "bg-green-900/80 text-green-200" : "bg-red-900/80 text-red-200"
          }`}
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}
