import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/current-user";

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireInstructor() {
  const user = await requireAuth();

if (
  user.role !== "mentor" &&
  user.role !== "admin"
) {
    redirect("/dashboard");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return user;
}