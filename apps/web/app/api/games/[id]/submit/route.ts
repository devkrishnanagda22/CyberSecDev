import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { getCurrentUser } from "@/lib/current-user";
import { connectDB } from "@/lib/mongodb";
import Game from "@/models/Game";
import GameScore from "@/models/GameScore";
import User from "@/models/User";

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid game id" }, { status: 400 });
    }

    const game: any = await Game.findById(id).lean();
    if (!game) {
      return NextResponse.json({ success: false, message: "Game not found" }, { status: 404 });
    }

    if (!game.published) {
      return NextResponse.json({ success: false, message: "Game is not published" }, { status: 403 });
    }

    const body = await request.json();
    const answer = typeof body.answer === "string" ? body.answer : typeof body.flag === "string" ? body.flag : "";

    if (!answer.trim()) {
      return NextResponse.json({ success: false, message: "Answer is required" }, { status: 400 });
    }

    const expectedSolution = typeof game.solution === "string" ? game.solution : "";
    const normalizedAnswer = normalize(answer);
    const normalizedSolution = normalize(expectedSolution);

    const existingScore = await GameScore.findOne({ gameId: game._id, userId: user._id }).exec();

    if (existingScore?.completed) {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        xp: 0,
        coins: 0,
        message: "Challenge already completed.",
      });
    }

    const attemptsValue = (existingScore?.attempts ?? 0) + 1;

    if (!expectedSolution || normalizedAnswer !== normalizedSolution) {
      const updatedScore = await GameScore.findOneAndUpdate(
        { gameId: game._id, userId: user._id },
        {
          $setOnInsert: {
            gameId: game._id,
            userId: user._id,
            score: 0,
            attempts: 0,
            completed: false,
            metadata: {},
          },
          $inc: { attempts: 1 },
          $set: {
            metadata: {
              ...(existingScore?.metadata || {}),
              lastAttemptAt: new Date().toISOString(),
            },
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      return NextResponse.json(
        {
          success: false,
          message: "Incorrect answer.",
          attempts: updatedScore?.attempts ?? attemptsValue,
        },
        { status: 400 }
      );
    }

    const scoreRecord = await GameScore.findOneAndUpdate(
      { gameId: game._id, userId: user._id, completed: false },
      {
        $set: {
          completed: true,
          score: Number(game.xpReward || 0),
          metadata: {
            ...(existingScore?.metadata || {}),
            lastAttemptAt: new Date().toISOString(),
            answerSubmitted: normalizedAnswer,
            rewardAwarded: true,
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

    if (!scoreRecord) {
      const finalRecord = await GameScore.findOne({ gameId: game._id, userId: user._id }).lean();
      if (finalRecord?.completed) {
        return NextResponse.json({
          success: true,
          alreadyCompleted: true,
          xp: 0,
          coins: 0,
          message: "Challenge already completed.",
        });
      }
    }

    const xpReward = Number(game.xpReward || 0);
    const coinsReward = Number(game.coinsReward || 0);

    const dbUser: any = await User.findById(user._id);
    if (dbUser) {
      dbUser.xp = (Number(dbUser.xp) || 0) + xpReward;
      dbUser.coins = (Number(dbUser.coins) || 0) + coinsReward;
      dbUser.completedGames = Array.isArray(dbUser.completedGames) ? dbUser.completedGames : [];

      if (!dbUser.completedGames.includes(game.slug)) {
        dbUser.completedGames.push(game.slug);
      }

      if (game.badge && !dbUser.badges.includes(game.badge)) {
        dbUser.badges.push(game.badge);
      }

      await dbUser.save();
    }

    return NextResponse.json({
      success: true,
      alreadyCompleted: false,
      xp: xpReward,
      coins: coinsReward,
      message: "Correct answer! Challenge complete.",
      completed: true,
    });
  } catch (error) {
    console.error("Game submission error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
