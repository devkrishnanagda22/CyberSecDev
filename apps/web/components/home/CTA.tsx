import Link from "next/link";
import { ShieldCheck, BookOpen, FlaskConical, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-indigo-50/50 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <div className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-indigo-100 text-primary mb-6 shadow-2xs">
          <ShieldCheck className="size-8" />
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Ready to Build Practical Cybersecurity Skills?
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Join CyberSecDev to explore guided lessons, practice hands-on lab scenarios,
          and track your progression from fundamentals to advanced defense.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/register"
            className={buttonVariants({ size: "lg", className: "h-11 px-6 shadow-xs" })}
          >
            Create Free Account
            <ArrowRight className="ml-2 size-4" />
          </Link>

          <Link
            href="/academy"
            className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 px-6 bg-white shadow-xs" })}
          >
            <BookOpen className="mr-2 size-4" />
            Explore Courses
          </Link>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3 text-left">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
            <BookOpen className="size-5 text-primary mb-3" />
            <h3 className="font-bold text-slate-900 text-sm">Guided Lessons</h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Step-by-step reading modules covering networking, Linux, and web application security.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
            <FlaskConical className="size-5 text-primary mb-3" />
            <h3 className="font-bold text-slate-900 text-sm">Virtual Labs</h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Safe hands-on testing targets with clear instructions and immediate flag validation.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
            <ShieldCheck className="size-5 text-primary mb-3" />
            <h3 className="font-bold text-slate-900 text-sm">Progress Tracking</h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Personalized dashboard measuring lesson completion, XP points, and achievement badges.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}