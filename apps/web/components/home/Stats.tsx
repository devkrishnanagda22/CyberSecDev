import Link from "next/link";
import { Bug, ArrowRight, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const labs = [
  {
    title: "Insecure Direct Object Reference",
    difficulty: "Beginner",
    category: "Access Control",
    slug: "web-basics-inspecting-http",
  },
  {
    title: "SQL Injection Fundamentals",
    difficulty: "Intermediate",
    category: "Database Security",
    slug: "sql-injection-intro",
  },
  {
    title: "Server-Side Request Forgery",
    difficulty: "Advanced",
    category: "Server Security",
    slug: "ssrf-internals",
  },
];

export default function Stats() {
  return (
    <section className="border-b border-border bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Curated Challenge Labs
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Featured Cybersecurity Labs
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Practice vulnerability discovery and remediation in isolated, guided lab environments.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {labs.map((lab) => (
            <div
              key={lab.title}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-7 shadow-xs transition duration-200 hover:border-slate-300 hover:shadow-md"
            >
              <div>
                <div className="mb-5 inline-flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-primary">
                  <Bug className="size-5" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">{lab.title}</h3>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                    {lab.difficulty}
                  </span>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">
                    {lab.category}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/labs"
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full justify-center shadow-2xs font-semibold hover:border-primary hover:text-primary",
                  })}
                >
                  View Lab Details
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}