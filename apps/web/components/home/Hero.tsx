import Link from "next/link";
import { Shield, ArrowRight, BookOpen, FlaskConical } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16 sm:py-24">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:items-center">
        {/* Left Side */}
        <div className="lg:col-span-7">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-semibold text-primary">
            <Shield className="size-4" aria-hidden="true" />
            <span>Interactive Cybersecurity Education Platform</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.12]">
            Learn Cybersecurity.
            <br />
            Practice Real Skills.
            <br />
            <span className="text-primary">Build Confidence.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Learn security fundamentals, explore hands-on labs, and develop practical
            skills through guided lessons and challenges—all in one learning platform.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              href="/academy"
              className={buttonVariants({ size: "lg", className: "h-11 px-5 shadow-xs" })}
            >
              <BookOpen className="mr-2 size-4" />
              Explore Academy
            </Link>

            <Link
              href="/labs"
              className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 px-5 shadow-xs" })}
            >
              <FlaskConical className="mr-2 size-4" />
              Start a Challenge
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
            <span className="rounded-full border border-border bg-white px-3.5 py-1.5 shadow-2xs">
              Structured Curriculum
            </span>
            <span className="rounded-full border border-border bg-white px-3.5 py-1.5 shadow-2xs">
              Guided Virtual Labs
            </span>
            <span className="rounded-full border border-border bg-white px-3.5 py-1.5 shadow-2xs">
              CTF Flag Submissions
            </span>
            <span className="rounded-full border border-border bg-white px-3.5 py-1.5 shadow-2xs">
              Verified Progress Tracking
            </span>
          </div>
        </div>

        {/* Right Side - Professional Terminal Preview */}
        <div className="lg:col-span-5">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="size-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="size-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="font-mono text-xs text-slate-400">
                cybersecdev-terminal
              </span>
            </div>

            <pre className="font-mono text-xs leading-relaxed text-emerald-400 overflow-x-auto">
{`$ cybersecdev init --workspace
[✓] Loading Academy catalog
[✓] Initializing virtual lab container
[✓] Loading CTF challenge flags
[✓] Setting up progress tracking

Ready: Start your first module in Academy`}
            </pre>

            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-medium text-white">Recommended Starting Point</span>
                <span className="rounded bg-indigo-500/20 px-2 py-0.5 font-semibold text-indigo-300">Beginner</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                Web Security Basics: Client-Server Architecture, HTTP headers, & authentication.
              </p>
              <Link
                href="/academy"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Go to Academy <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}