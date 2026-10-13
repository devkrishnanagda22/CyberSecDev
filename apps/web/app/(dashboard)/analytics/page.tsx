import Analytics from "@/components/ui/Analytics";
import { requireAdmin } from "@/lib/server-auth";

export default async function Page() {
  await requireAdmin();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Admin Analytics</h1>
      <div className="bg-card rounded p-4">
        <Analytics />
      </div>
    </div>
  );
}
