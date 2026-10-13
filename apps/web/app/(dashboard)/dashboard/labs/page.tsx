import Lab from "@/models/Lab";
import { connectDB } from "@/lib/mongodb";
import LabCard from "@/components/labs/LabCard";

export default async function Page() {
  await connectDB();
  const labs = await Lab.find({ published: true })
    .select("-flag")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Cyber Labs</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {labs.map((lab) => (
          <LabCard key={lab._id.toString()} lab={lab} />
        ))}
      </div>
    </div>
  );
}
