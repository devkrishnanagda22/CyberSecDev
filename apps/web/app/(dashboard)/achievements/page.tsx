import Achievements from "@/components/ui/Achievements";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-foreground">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Badges & Recognition</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Achievements</h1>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
          <Achievements />
        </div>
      </div>
    </main>
  );
}
