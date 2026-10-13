"use client";

import { Trophy } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
}

export default function AchievementPopup({
  open,
  title,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 rounded-2xl border border-cyan-500 bg-slate-900 p-6 shadow-2xl">

      <div className="flex items-center gap-4">

        <div className="rounded-full bg-cyan-500 p-3 text-black">
          <Trophy size={28} />
        </div>

        <div>

          <p className="text-sm text-gray-400">
            Achievement Unlocked
          </p>

          <h2 className="font-bold text-white">
            {title}
          </h2>

        </div>

      </div>

      <button
        onClick={onClose}
        className="mt-6 w-full rounded-lg bg-cyan-500 py-2 font-semibold text-black hover:bg-cyan-400"
      >
        Awesome!
      </button>

    </div>
  );
}