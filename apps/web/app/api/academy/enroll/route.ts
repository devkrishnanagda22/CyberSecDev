import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/current-user";

import mongoose from "mongoose";
import Course from "@/models/Course";
import Progress from "@/models/Progress";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const courseId =
      body && typeof body === "object" && !Array.isArray(body)
        ? (body as Record<string, unknown>).courseId
        : undefined;

    if (typeof courseId !== "string") {
      return NextResponse.json({ success: false, message: "courseId is required" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ success: false, message: "Invalid courseId" }, { status: 400 });
    }

    const course = await Course.findOne({ _id: courseId, published: true });

    if (!course) {
      return NextResponse.json({ success: false, message: "Course not found" }, { status: 404 });
    }

    let progress;

    try {
      progress = await Progress.findOneAndUpdate(
        { userId: user._id, courseId: course._id },
        {
          $setOnInsert: {
            userId: user._id,
            courseId: course._id,
            completedLessons: [],
            progress: 0,
            completed: false,
          },
        },
        { upsert: true, returnDocument: "after" }
      ).lean();
    } catch (error) {
      if (!isDuplicateKeyError(error)) {
        throw error;
      }

      progress = await Progress.findOne({ userId: user._id, courseId: course._id }).lean();
    }

    return NextResponse.json({
      success: true,
      message: "Enrolled",
      progress: progress
        ? {
            completed: progress.completed,
            progress: progress.progress,
            completedLessons: progress.completedLessons,
          }
        : null,
    });
  } catch (error) {
    console.error("Enroll Error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to enroll in this course." },
      { status: 500 }
    );
  }
}

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}
