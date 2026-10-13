"use client";

import { useState } from "react";

interface Props {
labId: string;
}

export default function FlagSubmission({ labId }: Props) {
const [flag, setFlag] = useState("");
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [success, setSuccess] = useState(false);

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
e.preventDefault();

if (loading) return;

if (!flag.trim()) {
  setSuccess(false);
  setMessage("Please enter a flag before submitting.");
  return;
}

setLoading(true);
setMessage("");

try {
  const res = await fetch("/api/labs/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({
      labId,
      flag: flag.trim(),
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    setSuccess(false);
    setMessage(data.message || "Submission failed.");
    return;
  }

  setSuccess(true);
  setMessage(
    "Success! " +
      data.message +
      " (+" +
      data.xp +
      " XP, +" +
      data.coins +
      " Coins)"
  );
} catch (error) {
  console.error("Flag submission error:", error);
  setSuccess(false);
  setMessage("Something went wrong. Please try again.");
} finally {
  setLoading(false);
}

}

return ( <div className="rounded-2xl border border-border bg-card p-6 shadow-xs sm:p-8"> <h2 className="mb-4 text-xl font-bold text-foreground">
Submit Flag </h2>

  <form onSubmit={handleSubmit} className="space-y-4">
    <label
      htmlFor="lab-flag"
      className="block text-sm font-medium text-foreground"
    >
      Challenge flag
    </label>

    <input
      id="lab-flag"
      name="flag"
      type="text"
      placeholder="FLAG{...}"
      value={flag}
      onChange={(e) => setFlag(e.target.value)}
      autoComplete="off"
      spellCheck={false}
      required
      disabled={loading}
      className="w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground shadow-2xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
    />

    <button
      type="submit"
      disabled={loading || !flag.trim()}
      className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-2xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Checking..." : "Submit Flag"}
    </button>
  </form>

  {message && (
    <div
      role={success ? "status" : "alert"}
      aria-live={success ? "polite" : "assertive"}
      className={`mt-4 rounded-lg border p-4 text-sm font-medium ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {message}
    </div>
  )}
</div>

);
}
