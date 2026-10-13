import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdminApi } from "@/lib/admin-api";

import User from "@/models/User";

export async function GET(request: NextRequest) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  try {
    await connectDB();

    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users.",
      },
      {
        status: 500,
      }
    );
  }
}