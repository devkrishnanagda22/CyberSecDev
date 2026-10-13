import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { requireAdminApi } from "@/lib/admin-api";
import { isValidSlug } from "@/lib/lab-content";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

const difficulties = ["Beginner", "Intermediate", "Advanced"] as const;
const allowedFields = new Set([
  "title", "slug", "description", "category", "difficulty", "xpReward",
  "estimatedHours", "published", "thumbnail",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validCourse(body: Record<string, unknown>) {
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
    typeof body.difficulty === "string" &&
    difficulties.includes(body.difficulty as (typeof difficulties)[number]) &&
    typeof body.xpReward === "number" &&
    Number.isInteger(body.xpReward) &&
    body.xpReward >= 0 &&
    body.xpReward <= 100000 &&
    typeof body.estimatedHours === "number" &&
    Number.isFinite(body.estimatedHours) &&
    body.estimatedHours >= 0 &&
    body.estimatedHours <= 1000 &&
    typeof body.published === "boolean" &&
    typeof body.thumbnail === "string" &&
    body.thumbnail.length <= 2000
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Course not found." },
        { status: 404 }
      );
    }
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body) || Object.keys(body).some((key) => !allowedFields.has(key))) {
      return NextResponse.json(
        { success: false, message: "Invalid course request body." },
        { status: 400 }
      );
    }

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found." },
        { status: 404 }
      );
    }

    const candidate: Record<string, unknown> = {
      title: course.title,
      slug: course.slug,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      xpReward: course.xpReward,
      estimatedHours: course.estimatedHours,
      published: course.published,
      thumbnail: course.thumbnail ?? "",
      ...body,
    };
    if (!validCourse(candidate)) {
      return NextResponse.json(
        { success: false, message: "One or more course fields are invalid." },
        { status: 400 }
      );
    }

    course.title = candidate.title as string;
    course.slug = candidate.slug as string;
    course.description = candidate.description as string;
    course.category = candidate.category as string;
    course.difficulty = candidate.difficulty as (typeof difficulties)[number];
    course.xpReward = candidate.xpReward as number;
    course.estimatedHours = candidate.estimatedHours as number;
    course.published = candidate.published as boolean;
    course.thumbnail = candidate.thumbnail as string;
    await course.save();

    return NextResponse.json({
      success: true,
      message: "Course updated successfully.",
      course,
    });
  } catch (error) {
    if (isVersionConflict(error)) {
      return NextResponse.json(
        { success: false, message: "Course changed while you were editing. Reload and try again." },
        { status: 409 }
      );
    }
    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { success: false, message: "A course with this slug already exists." },
        { status: 409 }
      );
    }
    console.error("Admin course update failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update course." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  return NextResponse.json(
    { success: false, message: "Unpublish the course to preserve learner history." },
    { status: 409 }
  );
}
