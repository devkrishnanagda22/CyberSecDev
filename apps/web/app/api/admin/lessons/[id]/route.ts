import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { requireAdminApi } from "@/lib/admin-api";
import { isValidSlug } from "@/lib/lab-content";

import Course from "@/models/Course";
import Lesson from "@/models/Lesson";

/* ==========================
   GET SINGLE LESSON
========================== */

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lesson id.",
        },
        {
          status: 400,
        }
      );
    }

    const lesson = await Lesson.findById(id).populate(
      "courseId",
      "title"
    );

    if (!lesson) {
      return NextResponse.json(
        {
          success: false,
          message: "Lesson not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch lesson.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ==========================
   UPDATE LESSON
========================== */

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lesson id.",
        },
        {
          status: 400,
        }
      );
    }

    const body: unknown = await request.json().catch(() => null);

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body) ||
      Object.keys(body).some(
        (key) =>
          ![
            "courseId", "title", "slug", "content", "order", "videoUrl",
            "duration", "xpReward", "published",
          ].includes(key)
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid lesson update request." },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return NextResponse.json(
        {
          success: false,
          message: "Lesson not found.",
        },
        {
          status: 404,
        }
      );
    }

    const candidate = {
      courseId: data.courseId ?? String(lesson.courseId),
      title: data.title ?? lesson.title,
      slug: data.slug ?? lesson.slug,
      content: data.content ?? lesson.content,
      order: data.order ?? lesson.order,
      videoUrl: data.videoUrl ?? lesson.videoUrl ?? "",
      duration: data.duration ?? lesson.duration,
      xpReward: data.xpReward ?? lesson.xpReward,
      published: data.published ?? lesson.published,
    };

    if (
      typeof candidate.courseId !== "string" ||
      !mongoose.Types.ObjectId.isValid(candidate.courseId) ||
      typeof candidate.title !== "string" ||
      !candidate.title.trim() ||
      candidate.title.length > 160 ||
      !isValidSlug(candidate.slug) ||
      typeof candidate.content !== "string" ||
      !candidate.content.trim() ||
      candidate.content.length > 50000 ||
      typeof candidate.order !== "number" ||
      !Number.isInteger(candidate.order) ||
      candidate.order < 1 ||
      candidate.order > 100000 ||
      typeof candidate.videoUrl !== "string" ||
      candidate.videoUrl.length > 2000 ||
      typeof candidate.duration !== "number" ||
      !Number.isFinite(candidate.duration) ||
      candidate.duration < 1 ||
      candidate.duration > 10000 ||
      typeof candidate.xpReward !== "number" ||
      !Number.isInteger(candidate.xpReward) ||
      candidate.xpReward < 0 ||
      candidate.xpReward > 100000 ||
      typeof candidate.published !== "boolean"
    ) {
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

    const existing = await Lesson.findOne({
      slug: candidate.slug,
      _id: { $ne: id },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Slug already exists.",
        },
        {
          status: 409,
        }
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
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { success: false, message: "A lesson with this slug already exists." },
        { status: 409 }
      );
    }
    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "VersionError"
    ) {
      return NextResponse.json(
        { success: false, message: "Lesson changed while you were editing. Reload and try again." },
        { status: 409 }
      );
    }

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update lesson.",
      },
      {
        status: 500,
      }
    );
  }
}

/* ==========================
   DELETE LESSON
========================== */

export async function DELETE(
  request: NextRequest
) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  return NextResponse.json(
    { success: false, message: "Unpublish the lesson to preserve learner history." },
    { status: 409 }
  );
}