import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/current-user";

import Lab from "@/models/Lab";
import LabProgress from "@/models/LabProgress";
import User from "@/models/User";
import { hashFlag, verifyFlag, verifyLegacyFlag } from "@/lib/lab-content";

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();
    const labId = typeof body?.labId === "string" ? body.labId : "";
    const rawFlag = typeof body?.flag === "string" ? body.flag : "";

    if (!labId || !rawFlag) {
      return NextResponse.json(
        {
          success: false,
          message: "labId and flag are required",
        },
        {
          status: 400,
        }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(labId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Lab not found",
        },
        {
          status: 404,
        }
      );
    }

    const lab = await Lab.findById(labId).select("+flag +flagHash");

    if (!lab) {
      return NextResponse.json(
        {
          success: false,
          message: "Lab not found",
        },
        {
          status: 404,
        }
      );
    }

    if (!lab.published) {
      return NextResponse.json(
        {
          success: false,
          message: "Lab is not published",
        },
        {
          status: 403,
        }
      );
    }

    const submittedFlag = rawFlag.trim();
    const validFlag = lab.flagHash
      ? await verifyFlag(submittedFlag, lab.flagHash)
      : typeof lab.flag === "string" &&
        verifyLegacyFlag(submittedFlag, lab.flag.trim());

    if (!validFlag) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect flag",
        },
        {
          status: 400,
        }
      );
    }

    if (!lab.flagHash && typeof lab.flag === "string") {
      const legacyFlag = lab.flag;
      await Lab.updateOne(
        {
          _id: lab._id,
          flagHash: { $in: [null, ""] },
          flag: legacyFlag,
        },
        {
          $set: { flagHash: await hashFlag(legacyFlag.trim()) },
          $unset: { flag: "" },
        }
      );
    }

    const rewardUpdate = await User.findOneAndUpdate(
      {
        _id: user._id,
        rewardedLabs: { $ne: lab._id },
        completedLabs: { $ne: lab.slug },
      },
      {
        $inc: {
          xp: Number(lab.xpReward || 0),
          coins: Number(lab.coinsReward || 0),
        },
        $addToSet: {
          completedLabs: lab.slug,
          rewardedLabs: lab._id,
        },
      },
      {
        returnDocument: "after",
      }
    ).lean();

    const alreadyCompleted = !rewardUpdate;

    if (!rewardUpdate) {
      const currentUser = await User.findById(user._id)
        .select("completedLabs rewardedLabs")
        .lean();

      if (!currentUser) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      const rewardWasClaimed = currentUser.rewardedLabs?.some(
        (rewardedLabId: mongoose.Types.ObjectId) =>
          rewardedLabId.toString() === lab._id.toString()
      );
      const legacyCompletion = currentUser.completedLabs?.includes(lab.slug);

      if (!rewardWasClaimed && legacyCompletion) {
        await User.updateOne(
          {
            _id: user._id,
            completedLabs: lab.slug,
            rewardedLabs: { $ne: lab._id },
          },
          { $addToSet: { rewardedLabs: lab._id } }
        );
      } else if (!rewardWasClaimed) {
        throw new Error("Lab reward claim could not be applied.");
      }
    }

    const now = new Date();

    try {
      const completedProgress = await LabProgress.findOneAndUpdate(
        {
          userId: user._id,
          labId: lab._id,
          completed: { $ne: true },
        },
        {
          $setOnInsert: {
            userId: user._id,
            labId: lab._id,
            startedAt: now,
          },
          $set: {
            started: true,
            completed: true,
            progress: 100,
            completedAt: now,
            updatedAt: now,
          },
        },
        {
          upsert: true,
          returnDocument: "after",
        }
      ).lean();

      if (!completedProgress) {
        const finalProgress = await LabProgress.findOne({
          userId: user._id,
          labId: lab._id,
        }).lean();

        if (!finalProgress?.completed) {
          throw new Error("Lab completion could not be persisted.");
        }
      }
    } catch (error) {
      if (!isDuplicateKeyError(error)) {
        throw error;
      }

      const finalProgress = await LabProgress.findOne({
        userId: user._id,
        labId: lab._id,
      }).lean();

      if (!finalProgress?.completed) {
        throw error;
      }
    }

    if (alreadyCompleted) {
      return NextResponse.json({
        success: true,
        alreadyCompleted: true,
        xp: 0,
        coins: 0,
        message: "Lab already completed",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Correct Flag!",
      xp: Number(lab.xpReward || 0),
      coins: Number(lab.coinsReward || 0),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}