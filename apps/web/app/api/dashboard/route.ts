import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/current-user";

import Course from "@/models/Course";
import Game from "@/models/Game";
import GameScore from "@/models/GameScore";
import Lab from "@/models/Lab";
import LabProgress from "@/models/LabProgress";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";
import User from "@/models/User";
import {
  getCourseResumeHref,
  summarizeCourseProgress,
} from "@/lib/academy-progress";

type DashboardUserSummary = {
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

type DashboardRecentActivity = {
  type: "course" | "lab" | "game";
  title: string;
  occurredAt: string;
  meta?: string;
};

type DashboardCourseProgress = {
  _id?: unknown;
  courseId?: unknown;
  completed?: boolean;
  progress?: number;
  completedLessons?: unknown[];
  updatedAt?: unknown;
  createdAt?: unknown;
  courseTitle?: string;
};

type DashboardContinueCourse = {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  progress: number;
  completed: boolean;
  completedCount: number;
  continueHref: string;
};

type DashboardLabProgress = {
  _id?: unknown;
  labId?: unknown;
  completed?: boolean;
  started?: boolean;
  completedAt?: unknown;
  updatedAt?: unknown;
  startedAt?: unknown;
  createdAt?: unknown;
};

type DashboardGameProgress = {
  _id?: unknown;
  gameId?: unknown;
  completed?: boolean;
  score?: number;
  updatedAt?: unknown;
  createdAt?: unknown;
};

function safeNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value.filter(Boolean) as T[]) : [];
}

function safeDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value as string | number | Date);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(value: unknown): string | null {
  const date = safeDate(value);
  return date ? date.toISOString() : null;
}

export async function GET() {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const user = await User.findById(currentUser._id).lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const courseProgress = (await Progress.find({
      userId: user._id,
    }).lean()) as DashboardCourseProgress[];

    const labProgress = (await LabProgress.find({
      userId: user._id,
    }).lean()) as DashboardLabProgress[];

    const gameProgress = (await GameScore.find({
      userId: user._id,
    }).lean()) as DashboardGameProgress[];

    const continueLearningRecords = await Promise.all(
      courseProgress.map(async (record: DashboardCourseProgress) => {
        const course = await Course.findOne({
          _id: record.courseId,
          published: true,
        })
          .select("title slug thumbnail")
          .lean();

        if (!course) {
          return null;
        }

        const lessons = await Lesson.find({
          courseId: course._id,
          published: true,
        })
          .sort({ order: 1 })
          .select("_id slug")
          .lean();
        const completedLessonIds = safeArray<string>(record.completedLessons);
        const progress = summarizeCourseProgress(
          lessons.map((lesson) => String(lesson._id)),
          completedLessonIds
        );
        const orderedLessons = lessons.map((lesson) => ({
          id: String(lesson._id),
          slug: safeString(lesson.slug),
        }));

        return {
          _id: String(course._id),
          title: safeString(course.title),
          slug: safeString(course.slug),
          thumbnail: safeString(course.thumbnail),
          progress: progress.progress,
          completed: progress.completed,
          completedCount: progress.completedCount,
          continueHref: getCourseResumeHref(
            safeString(course.slug),
            orderedLessons,
            completedLessonIds
          ),
        };
      })
    );

    const continueLearning = continueLearningRecords.filter(
      (record): record is DashboardContinueCourse => record !== null
    );
    const completedCourseIds = new Set(
      continueLearning
        .filter((record) => record.completed)
        .map((record) => record._id)
    );
    const enrolledCourses = continueLearning.length;
    const completedCourses = continueLearning.filter((record) => record.completed).length;
    const lessonsCompleted = continueLearning.reduce(
      (total, record) => total + record.completedCount,
      0
    );
    const totalLessons = await Lesson.countDocuments({ published: true });
    const overallProgress = totalLessons === 0
      ? 0
      : Math.round((lessonsCompleted / totalLessons) * 100);

    const recentLabs = await Promise.all(
      [...labProgress]
        .sort((a: DashboardLabProgress, b: DashboardLabProgress) => {
          const aDate = safeDate(a?.completedAt ?? a?.updatedAt ?? a?.startedAt ?? a?.createdAt) ?? new Date(0);
          const bDate = safeDate(b?.completedAt ?? b?.updatedAt ?? b?.startedAt ?? b?.createdAt) ?? new Date(0);
          return bDate.getTime() - aDate.getTime();
        })
        .slice(0, 5)
        .map(async (record: DashboardLabProgress) => {
          const lab = await Lab.findById(record.labId)
            .select("title xpReward coinsReward slug")
            .lean();

          return {
            _id: String(record._id ?? lab?._id ?? ""),
            title: safeString(lab?.title),
            slug: safeString(lab?.slug),
            completed: Boolean(record?.completed),
            started: Boolean(record?.started),
            completedAt: toIsoDate(record?.completedAt ?? record?.updatedAt ?? record?.createdAt),
            xpReward: safeNumber(lab?.xpReward, 0),
            coinsReward: safeNumber(lab?.coinsReward, 0),
          };
        })
    );

    const recentGames = await Promise.all(
      [...gameProgress]
        .sort((a: DashboardGameProgress, b: DashboardGameProgress) => {
          const aDate = safeDate(a?.updatedAt ?? a?.createdAt) ?? new Date(0);
          const bDate = safeDate(b?.updatedAt ?? b?.createdAt) ?? new Date(0);
          return bDate.getTime() - aDate.getTime();
        })
        .slice(0, 5)
        .map(async (record: DashboardGameProgress) => {
          const game = await Game.findById(record.gameId)
            .select("title xpReward coinsReward slug")
            .lean();

          return {
            _id: String(record._id ?? game?._id ?? ""),
            title: safeString(game?.title),
            slug: safeString(game?.slug),
            score: safeNumber(record?.score, 0),
            completed: Boolean(record?.completed),
            completedAt: toIsoDate(record?.updatedAt ?? record?.createdAt),
            xpReward: safeNumber(game?.xpReward, 0),
            coinsReward: safeNumber(game?.coinsReward, 0),
          };
        })
    );

    const recentActivity: DashboardRecentActivity[] = [
      ...courseProgress
        .filter((record: DashboardCourseProgress) =>
          completedCourseIds.has(String(record.courseId))
        )
        .map((record: DashboardCourseProgress) => ({
          type: "course" as const,
          title: safeString(record?.courseTitle ?? "Course completed"),
          occurredAt: toIsoDate(record?.updatedAt ?? record?.createdAt) ?? new Date(0).toISOString(),
        })),
      ...labProgress
        .filter((record: DashboardLabProgress) => Boolean(record?.completed))
        .map((record: DashboardLabProgress) => ({
          type: "lab" as const,
          title: "Lab completed",
          occurredAt: toIsoDate(record?.completedAt ?? record?.updatedAt ?? record?.createdAt) ?? new Date(0).toISOString(),
        })),
      ...gameProgress
        .filter((record: DashboardGameProgress) => Boolean(record?.completed))
        .map((record: DashboardGameProgress) => ({
          type: "game" as const,
          title: "Game completed",
          occurredAt: toIsoDate(record?.updatedAt ?? record?.createdAt) ?? new Date(0).toISOString(),
        })),
    ]
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
      .slice(0, 10);

    const activityDates = [
      safeDate(user?.lastLogin),
      ...courseProgress.map((record: DashboardCourseProgress) => safeDate(record?.updatedAt ?? record?.createdAt)),
      ...labProgress.map((record: DashboardLabProgress) => safeDate(record?.completedAt ?? record?.updatedAt ?? record?.startedAt ?? record?.createdAt)),
      ...gameProgress.map((record: DashboardGameProgress) => safeDate(record?.updatedAt ?? record?.createdAt)),
    ].filter((date): date is Date => Boolean(date));

    const lastActivityDate = activityDates.length
      ? new Date(Math.max(...activityDates.map((date) => date.getTime()))).toISOString()
      : null;

    const completedLabs = labProgress.filter(
      (record: DashboardLabProgress) => record?.completed === true
    ).length;

    const completedGames = gameProgress.filter(
      (record: DashboardGameProgress) => record?.completed === true
    ).length;

    const summaryUser: DashboardUserSummary = {
      name: safeString(user.name, "User"),
      email: safeString(user.email),
      role: safeString(user.role, "student"),
      level: Math.max(1, safeNumber(user.level, 1)),
      xp: safeNumber(user.xp, 0),
      coins: safeNumber(user.coins, 0),
      streak: safeNumber(user.streak, 0),
      badges: safeArray<string>(user.badges),
      lastLogin: toIsoDate(user.lastLogin),
    };

    const stats: DashboardStats = {
      enrolledCourses,
      completedCourses,
      lessonsCompleted,
      overallProgress,
      completedLabs,
      completedGames,
      challengesCompleted: completedLabs + completedGames,
      streak: summaryUser.streak,
      xp: summaryUser.xp,
      coins: summaryUser.coins,
      level: summaryUser.level,
      lastActivityDate,
    };

    return NextResponse.json({
      success: true,
      user: summaryUser,
      stats,
      continueLearning,
      recentLabs,
      recentGames,
      recentActivity,
      lastActivityDate,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}