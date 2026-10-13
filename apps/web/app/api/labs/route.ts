import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { toPublicLab } from "@/lib/lab-content";
import Lab from "@/models/Lab";

export async function GET() {
  try {
    await connectDB();

    const labs = await Lab.find({ published: true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      labs: labs.map((lab) => toPublicLab(lab)),
    });
  } catch (error) {
    console.error("Public labs GET failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load labs." },
      { status: 500 }
    );
  }
}
