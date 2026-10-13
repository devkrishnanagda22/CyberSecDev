import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { requireAdminApi } from "@/lib/admin-api";
import { hashFlag, verifyFlag } from "@/lib/lab-content";
import { connectDB } from "@/lib/mongodb";
import Lab from "@/models/Lab";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  try {
    await connectDB();
    const { id } = await params;
    const body: unknown = await request.json().catch(() => null);

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      typeof body !== "object" ||
      body === null ||
      !("flag" in body) ||
      typeof body.flag !== "string" ||
      !body.flag.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "A valid test flag is required." },
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

    const valid = lab.flagHash
      ? await verifyFlag(body.flag.trim(), lab.flagHash)
      : typeof lab.flag === "string" && body.flag.trim() === lab.flag.trim();

    if (valid && !lab.flagHash && lab.flag) {
      const legacyFlag = lab.flag;
      await Lab.updateOne(
        {
          _id: lab._id,
          flagHash: { $in: [null, ""] },
          flag: legacyFlag,
        },
        {
          $set: { flagHash: await hashFlag(legacyFlag.trim()) },
          $unset: { flag: "" },
        }
      );
    }

    return NextResponse.json({
      success: true,
      valid,
      message: valid
        ? "Challenge flag configuration is valid. No rewards were granted."
        : "The test flag does not match this challenge.",
    });
  } catch (error) {
    console.error("Admin lab configuration test failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to test challenge configuration." },
      { status: 500 }
    );
  }
}
