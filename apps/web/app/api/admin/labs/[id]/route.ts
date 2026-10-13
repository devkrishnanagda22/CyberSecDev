
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { requireAdminApi } from "@/lib/admin-api";
import { hashFlag, isValidSlug, toPublicLab } from "@/lib/lab-content";
import { connectDB } from "@/lib/mongodb";
import Lab from "@/models/Lab";

const difficulties = ["Beginner", "Intermediate", "Advanced"] as const;

const allowedFields = new Set([
  "title",
  "slug",
  "description",
  "difficulty",
  "estimatedHours",
  "instructions",
  "hints",
  "category",
  "xpReward",
  "coinsReward",
  "badge",
  "flag",
  "tags",
  "published",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
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

export async function GET(
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
        { success: false, message: "Lab not found." },
        { status: 404 }
      );
    }

    const lab = await Lab.findById(id).lean();

    if (!lab) {
      return NextResponse.json(
        { success: false, message: "Lab not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      lab: toPublicLab(lab),
    });
  } catch (error) {
    console.error("Admin lab GET failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load lab." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  try {
    await connectDB();

    const { id } = await params;
    const body: unknown = await request.json().catch(() => null);

    if (!mongoose.Types.ObjectId.isValid(id) || !isRecord(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid lab ID or request body." },
        { status: 400 }
      );
    }

    if (Object.keys(body).some((key) => !allowedFields.has(key))) {
      return NextResponse.json(
        { success: false, message: "Request contains unsupported fields." },
        { status: 400 }
      );
    }

    const lab = await Lab.findById(id).select("+flag +flagHash");

    if (!lab) {
      return NextResponse.json(
        { success: false, message: "Lab not found." },
        { status: 404 }
      );
    }

    const stringLimits: Record<string, number> = {
      title: 160,
      description: 5000,
      instructions: 30000,
      category: 100,
      badge: 100,
    };

    for (const [key, maxLength] of Object.entries(stringLimits)) {
      const value = body[key];

      if (
        value !== undefined &&
        (typeof value !== "string" ||
          value.length > maxLength ||
          (key === "title" && !value.trim()) ||
          (key === "category" && !value.trim()))
      ) {
        return NextResponse.json(
          { success: false, message: `Invalid ${key}.` },
          { status: 400 }
        );
      }
    }

    if (body.slug !== undefined && !isValidSlug(body.slug)) {
      return NextResponse.json(
        { success: false, message: "Invalid slug." },
        { status: 400 }
      );
    }

    if (
      body.difficulty !== undefined &&
      (typeof body.difficulty !== "string" ||
        !difficulties.includes(
          body.difficulty as (typeof difficulties)[number]
        ))
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid difficulty." },
        { status: 400 }
      );
    }

    for (const key of [
      "estimatedHours",
      "xpReward",
      "coinsReward",
    ] as const) {
      const value = body[key];

      if (
        value !== undefined &&
        (typeof value !== "number" ||
          !Number.isFinite(value) ||
          value < 0 ||
          value > (key === "estimatedHours" ? 1000 : 100000) ||
          (key !== "estimatedHours" && !Number.isInteger(value)))
      ) {
        return NextResponse.json(
          { success: false, message: `Invalid ${key}.` },
          { status: 400 }
        );
      }
    }

    for (const key of ["hints", "tags"] as const) {
      const value = body[key];
      const maxItemLength = key === "hints" ? 1000 : 80;

      if (
        value !== undefined &&
        (!Array.isArray(value) ||
          value.length > 30 ||
          !value.every(
            (item) =>
              typeof item === "string" &&
              item.length <= maxItemLength
          ))
      ) {
        return NextResponse.json(
          { success: false, message: `Invalid ${key}.` },
          { status: 400 }
        );
      }
    }

    if (
      body.published !== undefined &&
      typeof body.published !== "boolean"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid published state." },
        { status: 400 }
      );
    }

    if (
      body.flag !== undefined &&
      (typeof body.flag !== "string" ||
        !body.flag.trim() ||
        body.flag.trim().length > 512)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid expected flag." },
        { status: 400 }
      );
    }

    for (const key of [
      "title",
      "description",
      "instructions",
      "category",
      "badge",
    ] as const) {
      if (typeof body[key] === "string") {
        lab.set(key, body[key].trim());
      }
    }

    if (body.slug !== undefined) lab.set("slug", body.slug);
    if (body.difficulty !== undefined) {
      lab.set("difficulty", body.difficulty);
    }

    for (const key of [
      "estimatedHours",
      "xpReward",
      "coinsReward",
      "published",
    ] as const) {
      if (body[key] !== undefined) {
        lab.set(key, body[key]);
      }
    }

    if (Array.isArray(body.hints)) {
      lab.set(
        "hints",
        body.hints.map((item) => (item as string).trim()).filter(Boolean)
      );
    }

    if (Array.isArray(body.tags)) {
      lab.set(
        "tags",
        body.tags.map((item) => (item as string).trim()).filter(Boolean)
      );
    }

    // Hash a newly supplied flag. Never return the flag or hash to clients.
    if (typeof body.flag === "string") {
      lab.flagHash = await hashFlag(body.flag.trim());
      lab.flag = undefined;
    } else if (!lab.flagHash && typeof lab.flag === "string" && lab.flag.trim()) {
      // Migrate an existing legacy plaintext flag.
      lab.flagHash = await hashFlag(lab.flag.trim());
      lab.flag = undefined;
    }

    await lab.save();

    return NextResponse.json({
      success: true,
      message: "Lab updated successfully.",
      lab: toPublicLab(lab.toObject()),
    });
  } catch (error) {
    if (isVersionConflict(error)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Lab changed while you were editing. Reload and try again.",
        },
        { status: 409 }
      );
    }

    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        {
          success: false,
          message: "A lab with this slug already exists.",
        },
        { status: 409 }
      );
    }

    console.error("Admin lab update failed:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update lab." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  return NextResponse.json(
    {
      success: false,
      message: "Unpublish the lab to preserve learner history.",
    },
    { status: 409 }
  );
}