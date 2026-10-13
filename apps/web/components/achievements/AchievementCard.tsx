"use client";

import { Lock, CheckCircle2, Star } from "lucide-react";
import { Achievement } from "./achievementData";

interface Props {
  achievement: Achievement;
}

export default function AchievementCard({
  achievement,
}: Props) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-xs ${
        achievement.unlocked
          ? "border-emerald-200 bg-card hover:border-emerald-300 hover:shadow-sm hover:-translate-y-0.5"
          : "border-border bg-slate-50/70 opacity-70"
      }`}
    >
      <div
        className={`${achievement.color} h-1.5`}
      />

      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="text-4xl">
            {achievement.icon}
          </div>

          {achievement.unlocked ? (
            <CheckCircle2
              className="text-emerald-600"
              size={24}
            />
          ) : (
            <Lock
              className="text-slate-400"
              size={20}
            />
          )}
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          {achievement.title}
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          {achievement.description}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold">
            <Star
              size={15}
            />
            <span>
              {achievement.xp} XP
            </span>
          </div>

          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
              achievement.unlocked
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-100 text-slate-600"
            }`}
          >
            {achievement.unlocked
              ? "Unlocked"
              : "Locked"}
          </span>
        </div>
      </div>
    </div>
  );
}