import { ReactNode } from "react";

import { requireAuth } from "@/lib/server-auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth();

  return <>{children}</>;
}
