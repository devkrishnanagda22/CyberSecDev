import { notFound } from "next/navigation";

import { connectDB } from "@/lib/mongodb";
import { toPublicLab } from "@/lib/lab-content";
import Lab from "@/models/Lab";

import LabInstructions from "@/components/labs/LabInstructions";
import FlagSubmission from "@/components/labs/FlagSubmission";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function LabPage({
  params,
}: Props) {
  await connectDB();

  const { slug } = await params;

  const record = await Lab.findOne({
    slug,
    published: true,
  })
    .lean();

  if (!record) {
    notFound();
  }

  const lab = toPublicLab(record);

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-foreground">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Challenge</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{lab.title}</h1>
          <p className="mt-2 text-base text-slate-600 leading-relaxed">{lab.description}</p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-slate-50/70 p-3.5">
              <p className="text-xs font-medium text-slate-500">Difficulty</p>
              <p className="mt-1 text-base font-bold text-slate-900 capitalize">{lab.difficulty}</p>
            </div>
            <div className="rounded-xl border border-border bg-slate-50/70 p-3.5">
              <p className="text-xs font-medium text-slate-500">Time</p>
              <p className="mt-1 text-base font-bold text-slate-900">{lab.estimatedHours} hr</p>
            </div>
            <div className="rounded-xl border border-border bg-slate-50/70 p-3.5">
              <p className="text-xs font-medium text-slate-500">XP Reward</p>
              <p className="mt-1 text-base font-bold text-amber-600">+{lab.xpReward}</p>
            </div>
            <div className="rounded-xl border border-border bg-slate-50/70 p-3.5">
              <p className="text-xs font-medium text-slate-500">Coins</p>
              <p className="mt-1 text-base font-bold text-amber-600">+{lab.coinsReward}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-primary">{lab.category}</span>
            {Array.isArray(lab.tags) && lab.tags.map((tag: string) => (
              <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">#{tag}</span>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <LabInstructions instructions={lab.instructions} />

          {Array.isArray(lab.hints) && lab.hints.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 shadow-xs">
              <h2 className="text-lg font-bold text-amber-900">Hints</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-amber-800">
                {lab.hints.map((hint: string, index: number) => (
                  <li key={`${hint}-${index}`} className="ml-5 list-disc">{hint}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <FlagSubmission labId={lab._id} />
        </div>
      </div>
    </main>
  );
}