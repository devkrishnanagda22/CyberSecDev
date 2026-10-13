import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

export async function GET() {
  try {
    await connectDB();

    const courses = await Course.find({
      published: true,
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch courses.",
      },
      {
        status: 500,
      }
    );
  }
}