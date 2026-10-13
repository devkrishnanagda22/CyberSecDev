export async function getCourses() {
  const res = await fetch("/api/courses", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load courses");
  }

  return res.json();
}