import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    // Global top users by XP
    const top = await User.find({ isActive: true }).sort({ xp: -1 }).limit(20).select('name username xp level image').lean();

    // Weekly top — placeholder: top by recently updated xp (no history), so use same as global
    const weekly = top.slice(0, 10);

    return NextResponse.json({ success: true, top, weekly });
  } catch (error) {
    console.error('Leaderboard Error:', error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
