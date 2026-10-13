"use client";

import {
  Trophy,
  Coins,
  Flame,
  Pencil,
  Mail,
  Award,
} from "lucide-react";

type ProfileCardUser = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  level?: number | null;
  xp?: number | null;
  coins?: number | null;
  streak?: number | null;
  badges?: string[] | null;
};

interface ProfileCardProps {
  user?: ProfileCardUser | null;
  loading?: boolean;
}

export default function ProfileCard({ user, loading = false }: ProfileCardProps) {
  const currentXP = user?.xp ?? 0;
  const level = user?.level ?? 1;
  const currentLevelXP = (level - 1) * 100;
  const nextLevelXP = level * 100;
  const xpIntoLevel = Math.max(0, currentXP - currentLevelXP);
  const xpNeeded = Math.max(1, nextLevelXP - currentLevelXP);
  const progress = Math.max(
    0,
    Math.min((xpIntoLevel / xpNeeded) * 100, 100)
  );
  const badges = user?.badges?.length ?? 0;

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-2xl font-bold text-primary">
            {loading ? "..." : user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
        </div>

        <h2 className="mt-3 text-lg font-bold text-slate-900">
          {loading ? "Loading..." : user?.name || "CyberSecDev learner"}
        </h2>

        <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">
          {loading ? "Student" : user?.role || "student"}
        </span>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Mail size={14} />
          {loading ? "" : user?.email || "No email provided"}
        </div>
      </div>

      <div className="my-5 border-t border-slate-100" />

      <div className="space-y-3.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-600">
            <Trophy className="text-amber-500" size={16} />
            Level
          </span>
          <span className="font-bold text-primary">
            {loading ? "--" : level}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-600">
            <Coins className="text-amber-500" size={16} />
            Coins
          </span>
          <span className="font-bold text-slate-900">
            {loading ? "--" : user?.coins ?? 0}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-600">
            <Flame className="text-orange-500" size={16} />
            Streak
          </span>
          <span className="font-bold text-slate-900">
            {loading ? "--" : `${user?.streak ?? 0} Days`}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-600">
            <Award className="text-indigo-500" size={16} />
            Badges
          </span>
          <span className="font-bold text-slate-900">{loading ? "--" : badges}</span>
        </div>
      </div>

      <div className="my-5 border-t border-slate-100" />

      <div>
        <div className="mb-2 flex justify-between text-xs">
          <span className="text-slate-600 font-medium">Level Progress</span>
          <span className="font-semibold text-primary">
            {loading ? "--" : `${xpIntoLevel}/${xpNeeded} XP`}
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
      >
        <Pencil size={14} />
        Edit Profile
      </button>
    </div>
  );
}