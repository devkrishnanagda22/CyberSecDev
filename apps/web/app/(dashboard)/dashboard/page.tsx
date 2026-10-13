"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import QuickStats from "@/components/dashboard/QuickStats";
import ContinueLearning from "@/components/dashboard/ContinueLearning";
import BadgeGallery from "@/components/dashboard/BadgeGallery";
import RecentLabs from "@/components/dashboard/RecentLabs";
import RecentGames from "@/components/dashboard/RecentGames";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import ProfileCard from "@/components/dashboard/ProfileCard";

type DashboardUser = {
  name: string;
  email: string;
  role: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  badges: string[];
  lastLogin: string | null;
};

type DashboardStats = {
  enrolledCourses: number;
  completedCourses: number;
  lessonsCompleted: number;
  overallProgress: number;
  completedLabs: number;
  completedGames: number;
  challengesCompleted: number;
  streak: number;
  xp: number;
  coins: number;
  level: number;
  lastActivityDate: string | null;
};

type ContinueLearningItem = {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  progress: number;
  completed: boolean;
  continueHref: string;
};

type RecentLabItem = {
  _id?: string;
  title?: string;
  slug?: string;
  completed?: boolean;
  started?: boolean;
  completedAt?: string | null;
  xpReward?: number;
  coinsReward?: number;
};

type RecentGameItem = {
  _id?: string;
  title?: string;
  slug?: string;
  score?: number;
  completed?: boolean;
  completedAt?: string | null;
  xpReward?: number;
  coinsReward?: number;
};

type RecentActivityItem = {
  type: "course" | "lab" | "game";
  title: string;
  occurredAt: string;
  meta?: string;
};

type DashboardResponse = {
  success: boolean;
  user?: DashboardUser;
  stats?: DashboardStats;
  continueLearning?: ContinueLearningItem[];
  recentLabs?: RecentLabItem[];
  recentGames?: RecentGameItem[];
  recentActivity?: RecentActivityItem[];
  lastActivityDate?: string | null;
  message?: string;
};

const defaultUser: DashboardUser = {
  name: "CyberSecDev learner",
  email: "",
  role: "student",
  level: 1,
  xp: 0,
  coins: 0,
  streak: 0,
  badges: [],
  lastLogin: null,
};

const defaultStats: DashboardStats = {
  enrolledCourses: 0,
  completedCourses: 0,
  lessonsCompleted: 0,
  overallProgress: 0,
  completedLabs: 0,
  completedGames: 0,
  challengesCompleted: 0,
  streak: 0,
  xp: 0,
  coins: 0,
  level: 1,
  lastActivityDate: null,
};

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/dashboard", {
          cache: "no-store",
          credentials: "same-origin",
        });

        const data = (await res.json()) as DashboardResponse;

        if (!res.ok || !data.success) {
          setDashboard(null);
          setError(data.message ?? "Unable to load dashboard.");
          return;
        }

        setDashboard(data);
      } catch (requestError) {
        console.error("Dashboard fetch failed:", requestError);
        setDashboard(null);
        setError("Unable to load your dashboard right now.");
      } finally {
        setLoading(false);
      }
    }

    void fetchDashboard();
  }, []);

  const user = dashboard?.user ?? defaultUser;
  const stats = dashboard?.stats ?? defaultStats;
  const continueLearning = dashboard?.continueLearning ?? [];
  const recentLabs = dashboard?.recentLabs ?? [];
  const recentGames = dashboard?.recentGames ?? [];
  const recentActivity = dashboard?.recentActivity ?? [];

  return (
    <div className="min-h-screen bg-slate-50 text-foreground">
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 sm:p-8">
          <Topbar />

          {error ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <WelcomeBanner name={user.name} loading={loading && !dashboard} />

          <div className="mt-6 flex justify-end">
            <Link
              href="/academy"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <BookOpen size={18} aria-hidden="true" />
              <span>Explore Academy</span>
            </Link>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <QuickStats stats={stats} loading={loading && !dashboard} />
            </div>

            <ProfileCard user={user} loading={loading && !dashboard} />
          </div>

          <ContinueLearning
            courses={continueLearning}
            loading={loading && !dashboard}
          />

          <BadgeGallery />

          <RecentLabs labs={recentLabs} loading={loading && !dashboard} />

          <RecentGames games={recentGames} loading={loading && !dashboard} />

          <ActivityTimeline
            activities={recentActivity}
            loading={loading && !dashboard}
          />
        </main>
      </div>
    </div>
  );
}