interface WelcomeBannerProps {
  name?: string | null;
  loading?: boolean;
}

export default function WelcomeBanner({
  name,
  loading = false,
}: WelcomeBannerProps) {
  const displayName = name?.trim() || "CyberSecDev learner";

  return (
    <section className="mt-8 rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-xs">
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
        {loading ? "Loading dashboard..." : `Welcome back, ${displayName} 👋`}
      </h2>

      <p className="mt-2 text-sm sm:text-base text-slate-600">
        Pick up right where you left off in your cybersecurity learning track.
      </p>
    </section>
  );
}