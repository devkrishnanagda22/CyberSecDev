import { getCurrentUser } from "@/lib/current-user";

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return user !== null;
}

export async function isStudent() {
  const user = await getCurrentUser();

  if (!user) return false;

  return user.role === "student";
}

export async function isInstructor() {
  const user = await getCurrentUser();

  if (!user) return false;

  return (
    user.role === "mentor" ||
    user.role === "admin"
  );
}

export async function isAdmin() {
  const user = await getCurrentUser();

  if (!user) return false;

  return user.role === "admin";
}