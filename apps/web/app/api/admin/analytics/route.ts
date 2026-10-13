import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdminApi } from "@/lib/admin-api";
import User from "@/models/User";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Lab from "@/models/Lab";
import Game from "@/models/Game";
import Progress from "@/models/Progress";
import GameScore from "@/models/GameScore";

interface CourseProgressMetric {
  _id: unknown;
  enrollments: number;
  avgProgress: number;
}

export async function GET(request: NextRequest) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  try {
    await connectDB();

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalCourses = await Course.countDocuments();
    const totalLessons = await Lesson.countDocuments();
    const totalLabs = await Lab.countDocuments();
    const totalGames = await Game.countDocuments();

    const totalEnrollments = await Progress.countDocuments();
    const avgProgressAgg = await Progress.aggregate([{ $group: { _id: null, avg: { $avg: "$progress" } } }]);
    const avgProgress = avgProgressAgg[0]?.avg || 0;

    const topCoursesAgg = await Progress.aggregate([
      { $group: { _id: "$courseId", enrollments: { $sum: 1 }, avgProgress: { $avg: "$progress" } } },
      { $sort: { enrollments: -1 } },
      { $limit: 5 }
    ]);

    // Populate course titles
    const topCourses = await Promise.all(topCoursesAgg.map(async (c: CourseProgressMetric) => {
      const course = await Course.findById(c._id).lean();
      return { courseId: c._id, title: course?.title || 'Unknown', enrollments: c.enrollments, avgProgress: Math.round(c.avgProgress || 0) };
    }));

    // Games leaderboard count
    const totalScores = await GameScore.countDocuments();

    return NextResponse.json({ success: true, metrics: { totalUsers, activeUsers, totalCourses, totalLessons, totalLabs, totalGames, totalEnrollments, avgProgress: Math.round(avgProgress), topCourses, totalScores } });
  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
