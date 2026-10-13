import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

export async function GET() {
  try {
    await connectDB();

    const courses = await Course.find({ published: true })
      .select("title slug description category difficulty xpReward estimatedHours thumbnail")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, courses });
  } catch (error) {
    console.error("Academy course list failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to load courses." },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({ success: true, message: "Academy courses route ready." });
}
