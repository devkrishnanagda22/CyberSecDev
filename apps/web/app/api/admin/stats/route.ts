import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdminApi } from "@/lib/admin-api";

import User from "@/models/User";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";

export async function GET(request: NextRequest) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  try {
    await connectDB();

    const [
      totalUsers,
      totalCourses,
      totalLessons,
      totalProgress,
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Lesson.countDocuments(),
      Progress.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalLessons,
        totalProgress,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard statistics.",
      },
      {
        status: 500,
      }
    );
  }
}