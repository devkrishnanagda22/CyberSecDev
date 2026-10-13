import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/current-user";
import Game from "@/models/Game";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");
    const query = published ? { published: published === "true" } : {};

    const games = await Game.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, games });
  } catch (error) {
    console.error("Games GET Error:", error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const game = await Game.create({
      ...body,
      objectives: Array.isArray(body.objectives) ? body.objectives : [],
      hints: Array.isArray(body.hints) ? body.hints : [],
      published: Boolean(body.published),
      xpReward: Number(body.xpReward) || 250,
      coinsReward: Number(body.coinsReward) || 50,
      estimatedHours: Number(body.estimatedHours) || 1,
      timerSeconds: Number(body.timerSeconds) || 300,
    });

    return NextResponse.json({ success: true, message: "Game created successfully.", game });
  } catch (error) {
    console.error("Games POST Error:", error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
