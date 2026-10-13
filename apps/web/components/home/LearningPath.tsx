import Link from "next/link";
import {
  Network,
  Terminal,
  Globe,
  Shield,
  Bug,
  Flag,
  ArrowRight,
} from "lucide-react";

const roadmap = [
  {
    step: "01",
    icon: Network,
    title: "Networking & Protocols",
    description: "Understand TCP/IP, DNS resolution, HTTP request lifecycles, and port architectures.",
  },
  {
    step: "02",
    icon: Terminal,
    title: "Linux & Command Line",
    description: "Master terminal navigation, file permissions, environment variables, and essential shell tooling.",
  },
  {
    step: "03",
    icon: Globe,
    title: "Web Architecture & Security",
    description: "Examine client-server security models, browser cookies, sessions, and request headers.",
  },
  {
    step: "04",
    icon: Shield,
    title: "OWASP Vulnerability Core",
    description: "Learn how Injection, Broken Authentication, and Sensitive Data Exposure manifest and how to prevent them.",
  },
  {
    step: "05",
    icon: Bug,
    title: "Vulnerability Discovery",
    description: "Inspect responses, spot logic flaws, and build safe reproduction steps in virtual lab scenarios.",
  },
  {
    step: "06",
    icon: Flag,
    title: "Capture The Flag Arena",
    description: "Apply offensive and defensive knowledge to locate security flags and earn verified platform XP.",
  },
];

export default function LearningPath() {
  return (
    <section className="border-b border-border bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Curriculum Structure
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Structured Learning Roadmap
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Progress systematically from fundamental networking and operating systems
            to advanced vulnerability identification and defense.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roadmap.map((item) => (
            <div
              key={item.title}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-7 shadow-xs transition duration-200 hover:border-slate-300 hover:shadow-md"
            >
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <div className="inline-flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                    <item.icon className="size-5 text-primary" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400">
                    STEP {item.step}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/academy"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-indigo-700"
                >
                  View Academy courses <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}