import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { toPublicLab } from "@/lib/lab-content";
import Lab from "@/models/Lab";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Lab not found." },
        { status: 404 }
      );
    }

    const lab = await Lab.findOne({ _id: id, published: true }).lean();

    if (!lab) {
      return NextResponse.json(
        { success: false, message: "Lab not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, lab: toPublicLab(lab) });
  } catch (error) {
    console.error("Public lab detail GET failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load lab." },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  return NextResponse.json(
    { success: false, message: "Use the admin labs API." },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: "Use the admin labs API." },
    { status: 405 }
  );
}
