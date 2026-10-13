import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { requireAdminApi } from "@/lib/admin-api";
import { isValidSlug } from "@/lib/lab-content";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";

const allowedFields = new Set([
  "courseId", "title", "slug", "content", "order", "videoUrl",
  "duration", "xpReward", "published",
]);

interface LessonData {
  courseId: string;
  title: string;
  slug: string;
  content: string;
  order: number;
  videoUrl: string;
  duration: number;
  xpReward: number;
  published: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validLesson(body: unknown): body is LessonData {
  if (!isRecord(body)) return false;
  return (
    typeof body.courseId === "string" &&
    mongoose.Types.ObjectId.isValid(body.courseId) &&
    typeof body.title === "string" &&
    body.title.trim().length > 0 &&
    body.title.length <= 160 &&
    isValidSlug(body.slug) &&
    typeof body.content === "string" &&
    body.content.trim().length > 0 &&
    body.content.length <= 50000 &&
    typeof body.order === "number" &&
    Number.isInteger(body.order) &&
    body.order >= 1 &&
    body.order <= 100000 &&
    typeof body.videoUrl === "string" &&
    body.videoUrl.length <= 2000 &&
    typeof body.duration === "number" &&
    Number.isFinite(body.duration) &&
    body.duration >= 1 &&
    body.duration <= 10000 &&
    typeof body.xpReward === "number" &&
    Number.isInteger(body.xpReward) &&
    body.xpReward >= 0 &&
    body.xpReward <= 100000 &&
    typeof body.published === "boolean"
  );
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

function isVersionConflict(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "VersionError"
  );
}

export async function GET(request: NextRequest) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 10));
    const search = searchParams.get("search")?.trim().slice(0, 100) ?? "";
    const course = searchParams.get("course");
    const publishedParam = searchParams.get("published");
    const query: Record<string, unknown> = {};

    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.title = { $regex: safeSearch, $options: "i" };
    }
    if (course) {
      if (!mongoose.Types.ObjectId.isValid(course)) {
        return NextResponse.json(
          { success: false, message: "Invalid course id." },
          { status: 400 }
        );
      }
      query.courseId = course;
    }
    if (publishedParam === "true" || publishedParam === "false") {
      query.published = publishedParam === "true";
    }

    const sort = searchParams.get("sort");
    const sortOption: { createdAt?: 1 | -1; title?: 1 | -1 } =
      sort === "oldest"
        ? { createdAt: 1 as const }
        : sort === "title"
          ? { title: 1 as const }
          : { createdAt: -1 as const };
    const [total, lessons] = await Promise.all([
      Lesson.countDocuments(query),
      Lesson.find(query)
        .populate("courseId", "title")
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      lessons,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin lessons GET failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load lessons." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  try {
    await connectDB();
    const body: unknown = await request.json().catch(() => null);
    if (
      !validLesson(body) ||
      Object.keys(body).some((key) => !allowedFields.has(key))
    ) {
      return NextResponse.json(
        { success: false, message: "One or more required lesson fields are invalid." },
        { status: 400 }
      );
    }

    const course = await Course.findById(body.courseId).select("_id");
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found." },
        { status: 404 }
      );
    }

    const lesson = await Lesson.create({
      courseId: body.courseId,
      title: body.title.trim(),
      slug: body.slug,
      content: body.content,
      order: body.order,
      videoUrl: body.videoUrl,
      duration: body.duration,
      xpReward: body.xpReward,
      published: body.published,
    });

    return NextResponse.json(
      { success: true, message: "Lesson created successfully.", lesson },
      { status: 201 }
    );
  } catch (error) {
    if (isVersionConflict(error)) {
      return NextResponse.json(
        { success: false, message: "Lesson changed while you were editing. Reload and try again." },
        { status: 409 }
      );
    }
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { success: false, message: "A lesson with this slug already exists." },
        { status: 409 }
      );
    }
    console.error("Admin lesson create failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to create lesson." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  try {
    await connectDB();
    const body: unknown = await request.json().catch(() => null);
    if (
      !isRecord(body) ||
      typeof body.lessonId !== "string" ||
      !mongoose.Types.ObjectId.isValid(body.lessonId) ||
      Object.keys(body).some(
        (key) => key !== "lessonId" && !allowedFields.has(key)
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid lesson update request." },
        { status: 400 }
      );
    }

    const lesson = await Lesson.findById(body.lessonId);
    if (!lesson) {
      return NextResponse.json(
        { success: false, message: "Lesson not found." },
        { status: 404 }
      );
    }

    const candidate: Record<string, unknown> = {
      courseId: String(lesson.courseId),
      title: lesson.title,
      slug: lesson.slug,
      content: lesson.content,
      order: lesson.order,
      videoUrl: lesson.videoUrl ?? "",
      duration: lesson.duration,
      xpReward: lesson.xpReward,
      published: lesson.published,
      ...body,
    };
    if (!validLesson(candidate)) {
      return NextResponse.json(
        { success: false, message: "One or more lesson fields are invalid." },
        { status: 400 }
      );
    }

    const course = await Course.findById(candidate.courseId).select("_id");
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found." },
        { status: 404 }
      );
    }

    lesson.courseId = candidate.courseId;
    lesson.title = candidate.title.trim();
    lesson.slug = candidate.slug;
    lesson.content = candidate.content;
    lesson.order = candidate.order;
    lesson.videoUrl = candidate.videoUrl;
    lesson.duration = candidate.duration;
    lesson.xpReward = candidate.xpReward;
    lesson.published = candidate.published;
    await lesson.save();

    return NextResponse.json({
      success: true,
      message: "Lesson updated successfully.",
      lesson,
    });
  } catch (error) {
    if (isVersionConflict(error)) {
      return NextResponse.json(
        { success: false, message: "Lesson changed while you were editing. Reload and try again." },
        { status: 409 }
      );
    }
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { success: false, message: "A lesson with this slug already exists." },
        { status: 409 }
      );
    }
    console.error("Admin lesson update failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update lesson." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  return NextResponse.json(
    { success: false, message: "Unpublish the lesson to preserve learner history." },
    { status: 409 }
  );
}
