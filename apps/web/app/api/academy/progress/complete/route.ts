import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/current-user";
import mongoose from "mongoose";

import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";
import User from "@/models/User";
import { updateLessonProgress } from "@/lib/academy-progress";

type CompletionResult =
  | { kind: "not-found"; entity: "course" | "lesson" }
  | {
      kind: "complete";
      alreadyCompleted: boolean;
      awardedXP: number;
      completedLessons: string[];
      completedCount: number;
      totalLessons: number;
      progress: number;
      courseCompleted: boolean;
    };

class AuthenticatedUserMissingError extends Error {}

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(last: Date, today: Date) {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  return (
    last.getFullYear() === yesterday.getFullYear() &&
    last.getMonth() === yesterday.getMonth() &&
    last.getDate() === yesterday.getDate()
  );
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser(request);

    if (!user) {
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

    const body = await request.json().catch(() => null);
    const payload =
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as Record<string, unknown>)
        : null;
    const courseId = payload?.courseId;
    const lessonId = payload?.lessonId;

    if (typeof courseId !== "string" || typeof lessonId !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "courseId and lessonId required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(lessonId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid ids",
        },
        {
          status: 400,
        }
      );
    }

    const lessonKey = lessonId;
    let result: CompletionResult | undefined;
    let completedTransaction = false;

    for (let attempt = 0; attempt < 3 && !completedTransaction; attempt += 1) {
      const session = await mongoose.startSession();

      try {
        result = undefined;

        await session.withTransaction(async () => {
          result = undefined;
          const course = await Course.findOne({ _id: courseId, published: true })
            .session(session)
            .lean();

          if (!course) {
            result = { kind: "not-found", entity: "course" };
            return;
          }

          const lesson = await Lesson.findOne({
            _id: lessonId,
            courseId: course._id,
            published: true,
          })
            .session(session)
            .lean();

          if (!lesson) {
            result = { kind: "not-found", entity: "lesson" };
            return;
          }

          const requiredLessons = await Lesson.find({
            courseId: course._id,
            published: true,
          })
            .select("_id")
            .session(session)
            .lean();
          const requiredLessonIds = requiredLessons.map((item) => String(item._id));

          if (requiredLessonIds.length === 0) {
            result = { kind: "not-found", entity: "lesson" };
            return;
          }

          const progress =
            (await Progress.findOne({ userId: user._id, courseId: course._id })
              .session(session)) ??
            new Progress({
              userId: user._id,
              courseId: course._id,
              completedLessons: [],
              progress: 0,
              completed: false,
            });
          const previousLessonIds = Array.isArray(progress.completedLessons)
            ? [...progress.completedLessons]
            : [];
          const lessonProgress = updateLessonProgress(
            previousLessonIds,
            lessonKey,
            requiredLessonIds
          );

          progress.completedLessons = lessonProgress.completedLessonIds;
          progress.progress = lessonProgress.progress;
          progress.completed = lessonProgress.completed;
          await progress.save({ session });

          const awardedXP = lessonProgress.alreadyCompleted
            ? 0
            : Number(lesson.xpReward || 0);

          if (!lessonProgress.alreadyCompleted) {
            const dbUser = await User.findById(user._id).session(session);

            if (!dbUser) {
              throw new AuthenticatedUserMissingError();
            }

            dbUser.xp = Number(dbUser.xp || 0) + awardedXP;

            while (dbUser.xp >= dbUser.level * 100) {
              dbUser.level += 1;
              dbUser.coins += 10;
            }

            if (
              lessonProgress.completed &&
              !dbUser.completedCourses.includes(course.slug)
            ) {
              dbUser.completedCourses.push(course.slug);
            }

            const today = new Date();

            if (!dbUser.lastLogin) {
              dbUser.streak = 1;
            } else {
              const last = new Date(dbUser.lastLogin);

              if (isSameDay(last, today)) {
                // The learner has already earned today's streak credit.
              } else if (isYesterday(last, today)) {
                dbUser.streak += 1;
              } else {
                dbUser.streak = 1;
              }
            }

            dbUser.lastLogin = today;

            const badges: string[] = [];

            if (lessonProgress.completed) {
              badges.push(`Course Complete: ${course.title}`);
            }

            const allProgress = await Progress.find({ userId: dbUser._id })
              .select("completedLessons")
              .session(session)
              .lean();
            const lessonCount = allProgress.reduce(
              (sum, record) =>
                sum + (Array.isArray(record.completedLessons) ? record.completedLessons.length : 0),
              0
            );

            if (lessonCount >= 5) badges.push("5 Lessons Completed");
            if (lessonCount >= 25) badges.push("25 Lessons Completed");
            if (lessonCount >= 50) badges.push("50 Lessons Completed");
            if (dbUser.level >= 10) badges.push("Level 10");
            if (dbUser.level >= 25) badges.push("Level 25");

            dbUser.badges = [...new Set([...(dbUser.badges || []), ...badges])];
            await dbUser.save({ session });
          }

          result = {
            kind: "complete",
            alreadyCompleted: lessonProgress.alreadyCompleted,
            awardedXP,
            completedLessons: lessonProgress.completedLessonIds,
            completedCount: lessonProgress.completedCount,
            totalLessons: requiredLessonIds.length,
            progress: lessonProgress.progress,
            courseCompleted: lessonProgress.completed,
          };
        });

        completedTransaction = true;
      } catch (error) {
        if (!isDuplicateKeyError(error) || attempt === 2) {
          throw error;
        }
      } finally {
        await session.endSession();
      }
    }

    if (!result) {
      throw new Error("Lesson completion transaction did not produce a result.");
    }

    if (result.kind === "not-found") {
      return NextResponse.json(
        { success: false, message: result.entity === "course" ? "Course not found" : "Lesson not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      alreadyCompleted: result.alreadyCompleted,
      awardedXP: result.awardedXP,
      progress: {
        completed: result.courseCompleted,
        progress: result.progress,
        completedLessons: result.completedLessons,
        completedCount: result.completedCount,
        totalLessons: result.totalLessons,
      },
    });
  } catch (error) {
    console.error("Lesson completion failed:", error);

    if (error instanceof AuthenticatedUserMissingError) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save lesson progress.",
      },
      {
        status: 500,
      }
    );
  }
}
