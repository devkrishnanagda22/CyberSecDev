import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-api";
import { hashFlag, isValidSlug, toPublicLab } from "@/lib/lab-content";
import { connectDB } from "@/lib/mongodb";
import Lab from "@/models/Lab";

const difficulties = ["Beginner", "Intermediate", "Advanced"] as const;
const allowedFields = new Set([
  "title", "slug", "description", "difficulty", "estimatedHours",
  "instructions", "hints", "category", "xpReward", "coinsReward",
  "badge", "flag", "tags", "published",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validStrings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export async function GET(request: NextRequest) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  try {
    await connectDB();
    const labs = await Lab.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      labs: labs.map((lab) => toPublicLab(lab)),
    });
  } catch (error) {
    console.error("Admin labs GET failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load labs." },
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

    if (!isRecord(body)) {
      return NextResponse.json(
        { success: false, message: "A valid JSON object is required." },
        { status: 400 }
      );
    }
    if (Object.keys(body).some((key) => !allowedFields.has(key))) {
      return NextResponse.json(
        { success: false, message: "Request contains unsupported fields." },
        { status: 400 }
      );
    }

    const {
      title,
      slug,
      description = "",
      difficulty = "Beginner",
      estimatedHours = 1,
      instructions = "",
      hints = [],
      category = "General",
      xpReward = 200,
      coinsReward = 25,
      badge = "",
      flag,
      tags = [],
      published = false,
    } = body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 160 ||
      !isValidSlug(slug) ||
      typeof flag !== "string" ||
      !flag.trim() ||
      flag.length > 512 ||
      typeof description !== "string" ||
      description.length > 5000 ||
      typeof instructions !== "string" ||
      instructions.length > 30000 ||
      typeof difficulty !== "string" ||
      !difficulties.includes(difficulty as (typeof difficulties)[number]) ||
      typeof category !== "string" ||
      !category.trim() ||
      category.length > 100 ||
      typeof estimatedHours !== "number" ||
      !Number.isFinite(estimatedHours) ||
      estimatedHours < 0 ||
      estimatedHours > 1000 ||
      typeof xpReward !== "number" ||
      !Number.isInteger(xpReward) ||
      xpReward < 0 ||
      xpReward > 100000 ||
      typeof coinsReward !== "number" ||
      !Number.isInteger(coinsReward) ||
      coinsReward < 0 ||
      coinsReward > 100000 ||
      typeof badge !== "string" ||
      badge.length > 100 ||
      !validStrings(hints) ||
      hints.length > 30 ||
      hints.some((hint) => hint.length > 1000) ||
      !validStrings(tags) ||
      tags.length > 30 ||
      tags.some((tag) => tag.length > 80) ||
      typeof published !== "boolean"
    ) {
      return NextResponse.json(
        { success: false, message: "One or more challenge fields are invalid." },
        { status: 400 }
      );
    }

    const lab = await Lab.create({
      title: title.trim(),
      slug,
      description,
      difficulty,
      estimatedHours,
      instructions,
      hints: hints.map((hint) => hint.trim()).filter(Boolean),
      category: category.trim(),
      xpReward,
      coinsReward,
      badge: badge.trim(),
      flagHash: await hashFlag(flag.trim()),
      tags: tags.map((tag) => tag.trim()).filter(Boolean),
      published,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Lab created successfully.",
        lab: toPublicLab(lab.toObject()),
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { success: false, message: "A lab with this slug already exists." },
        { status: 409 }
      );
    }

    console.error("Admin lab create failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to create lab." },
      { status: 500 }
    );
  }
}
