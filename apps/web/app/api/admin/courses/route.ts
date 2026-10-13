import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-api";
import { isValidSlug } from "@/lib/lab-content";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

const difficulties = ["Beginner", "Intermediate", "Advanced"] as const;
const allowedCourseFields = new Set([
  "title", "slug", "description", "category", "difficulty",
  "xpReward", "estimatedHours", "published", "thumbnail",
]);

interface CourseCreatePayload {
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty?: (typeof difficulties)[number];
  xpReward?: number;
  estimatedHours?: number;
  published?: boolean;
  thumbnail?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

function validCourse(body: unknown): body is CourseCreatePayload {
  if (!isRecord(body)) return false;
  return (
    typeof body.title === "string" &&
    body.title.trim().length > 0 &&
    body.title.length <= 160 &&
    isValidSlug(body.slug) &&
    typeof body.description === "string" &&
    body.description.trim().length > 0 &&
    body.description.length <= 5000 &&
    typeof body.category === "string" &&
    body.category.trim().length > 0 &&
    body.category.length <= 100 &&
    (body.difficulty === undefined ||
      (typeof body.difficulty === "string" &&
        difficulties.includes(body.difficulty as (typeof difficulties)[number]))) &&
    (body.xpReward === undefined ||
      (typeof body.xpReward === "number" &&
        Number.isInteger(body.xpReward) &&
        body.xpReward >= 0 &&
        body.xpReward <= 100000)) &&
    (body.estimatedHours === undefined ||
      (typeof body.estimatedHours === "number" &&
        Number.isFinite(body.estimatedHours) &&
        body.estimatedHours >= 0 &&
        body.estimatedHours <= 1000)) &&
    (body.published === undefined || typeof body.published === "boolean") &&
    (body.thumbnail === undefined ||
      (typeof body.thumbnail === "string" && body.thumbnail.length <= 2000))
  );
}

export async function GET(request: NextRequest) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim().slice(0, 100) ?? "";
    const category = searchParams.get("category") ?? "";
    const difficulty = searchParams.get("difficulty") ?? "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 100));
    const sort = searchParams.get("sort") ?? "newest";
    const query: Record<string, unknown> = {};

    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }
    if (category) query.category = category;
    if (difficulties.includes(difficulty as (typeof difficulties)[number])) {
      query.difficulty = difficulty;
    }

    const sortOption: { createdAt?: 1 | -1; title?: 1 | -1 } =
      sort === "oldest"
        ? { createdAt: 1 as const }
        : sort === "title"
          ? { title: 1 as const }
          : { createdAt: -1 as const };
    const [total, courses] = await Promise.all([
      Course.countDocuments(query),
      Course.find(query)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      courses,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin courses GET failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load courses." },
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
      !validCourse(body) ||
      Object.keys(body).some((key) => !allowedCourseFields.has(key))
    ) {
      return NextResponse.json(
        { success: false, message: "One or more required course fields are invalid." },
        { status: 400 }
      );
    }

    const course = await Course.create({
      title: body.title.trim(),
      slug: body.slug,
      description: body.description.trim(),
      category: body.category.trim(),
      difficulty: body.difficulty ?? "Beginner",
      xpReward: body.xpReward ?? 100,
      estimatedHours: body.estimatedHours ?? 2,
      published: body.published ?? false,
      thumbnail: typeof body.thumbnail === "string" ? body.thumbnail.trim() : "",
    });

    return NextResponse.json(
      { success: true, message: "Course created successfully.", course },
      { status: 201 }
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { success: false, message: "A course with this slug already exists." },
        { status: 409 }
      );
    }
    console.error("Admin course create failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to create course." },
      { status: 500 }
    );
  }
}
