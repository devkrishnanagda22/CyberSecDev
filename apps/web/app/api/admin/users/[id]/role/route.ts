import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdminApi } from "@/lib/admin-api";

import User from "@/models/User";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdminApi(request);
  if (response) return response;

  try {
    await connectDB();

    const { id } = await params;
    const { role } = await request.json();

    const allowedRoles = ["student", "mentor", "admin"];

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role.",
        },
        {
          status: 400,
        }
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    user.role = role;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "User role updated successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update User Role Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user role.",
      },
      {
        status: 500,
      }
    );
  }
}