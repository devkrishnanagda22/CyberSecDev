import LabForm from "@/components/labs/LabForm";
import { requireAdmin } from "@/lib/server-auth";
import { connectDB } from "@/lib/mongodb";
import { toPublicLab } from "@/lib/lab-content";
import Lab from "@/models/Lab";

export default async function AdminLabsPage() {
  await requireAdmin();
  await connectDB();
  const records = await Lab.find({}).sort({ createdAt: -1 }).lean();
  const labs = records.map((lab) => toPublicLab(lab));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-cyan-400">Lab Management</h1>
        <p className="mt-3 text-gray-400">
          Create, edit, publish and manage cybersecurity labs for the full platform.
        </p>
      </div>

      <LabForm initialLabs={labs} />
    </div>
  );
}