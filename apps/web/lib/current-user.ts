import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import User from "@/models/User";

function getTokenFromCookieHeader(cookieHeader: string | null | undefined) {
  if (!cookieHeader) {
    return undefined;
  }

  const tokenCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("token="));

  return tokenCookie ? decodeURIComponent(tokenCookie.slice("token=".length)) : undefined;
}

export async function getCurrentUser(request?: NextRequest | Request) {
  try {
    await connectDB();

    let token: string | undefined;

    if (request) {
      const headerCookie = request.headers.get("cookie");
      token = getTokenFromCookieHeader(headerCookie);

      if (!token && "cookies" in request && typeof request.cookies?.get === "function") {
        token = request.cookies.get("token")?.value;
      }
    }

    if (!token) {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get("token")?.value;
      } catch {
        token = undefined;
      }
    }

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return null;
    }

    const user = await User.findById(decoded.id).select("-password -rewardedLabs");

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error(error);
    return null;
  }
}