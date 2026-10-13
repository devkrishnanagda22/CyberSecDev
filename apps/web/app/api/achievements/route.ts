import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/current-user";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const dbUser = await User.findById(user._id).select('badges xp level completedCourses').lean();

    const definitions = [
      { id: 'course_complete', title: 'Course Complete', description: 'Awarded when you finish a course.' },
      { id: 'lesson_learner', title: 'Lesson Learner', description: 'Complete 5 lessons.' },
      { id: 'veteran', title: 'Veteran', description: 'Reach level 10.' },
    ];

    return NextResponse.json({ success: true, badges: dbUser?.badges || [], xp: dbUser?.xp || 0, level: dbUser?.level || 1, completedCourses: dbUser?.completedCourses || [], definitions });
  } catch (error) {
    console.error('Achievements Error:', error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
