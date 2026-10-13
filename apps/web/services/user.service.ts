export async function getCurrentUser() {
  const res = await fetch("/api/user/me", {
    cache: "no-store",
    credentials: "same-origin",
  });

  return res.json();
}