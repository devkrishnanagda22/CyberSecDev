import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/current-user";
import Game from "@/models/Game";
import GameScore from "@/models/GameScore";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
    }

    const top = await GameScore.find({ gameId: id })
      .sort({ score: -1, createdAt: 1 })
      .limit(20)
      .populate("userId", "username name image")
      .lean();

    return NextResponse.json({ success: true, top });
  } catch (error) {
    console.error("Scores GET Error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
    }

    const game = await Game.findById(id);
    if (!game) {
      return NextResponse.json({ success: false, message: "Game not found" }, { status: 404 });
    }

    const body = await request.json();
    const rawScore = Number(body.score);

    if (!Number.isFinite(rawScore)) {
      return NextResponse.json({ success: false, message: "score must be a number" }, { status: 400 });
    }

    const existing = await GameScore.findOne({ gameId: game._id, userId: user._id }).lean();

    const nextScore = Math.max(existing?.score ?? 0, rawScore);
    const nextAttempts = (existing?.attempts ?? 0) + 1;

    const updated = await GameScore.findOneAndUpdate(
      { gameId: game._id, userId: user._id },
      {
        $setOnInsert: {
          gameId: game._id,
          userId: user._id,
          completed: false,
          score: 0,
          attempts: 0,
          metadata: {},
        },
        $set: {
          score: nextScore,
          metadata: {
            ...(existing?.metadata || {}),
            lastSubmittedScore: rawScore,
            updatedAt: new Date().toISOString(),
          },
        },
        $inc: { attempts: 1 },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({
      success: true,
      score: updated?.score ?? nextScore,
      attempts: updated?.attempts ?? nextAttempts,
      completed: Boolean(updated?.completed),
    });
  } catch (error) {
    console.error("Scores POST Error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
