import {
  Shield,
  Gamepad2,
  FlaskConical,
  Trophy,
  BookOpen,
  Terminal,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Structured Academy",
    description:
      "Learn core security concepts step by step with guided reading, architecture walkthroughs, and practical examples.",
  },
  {
    icon: FlaskConical,
    title: "Interactive Labs",
    description:
      "Practice offensive and defensive techniques safely in guided scenario-based challenges with real security targets.",
  },
  {
    icon: Shield,
    title: "CTF Challenges",
    description:
      "Test your problem-solving skills with Capture The Flag missions featuring server-side flag validation.",
  },
  {
    icon: Trophy,
    title: "Verified Progression",
    description:
      "Track your completed lessons, earned XP, coins, learning streaks, and earned badges as your skills grow.",
  },
  {
    icon: Gamepad2,
    title: "Cyber Security Games",
    description:
      "Reinforce critical concepts in web security, blue teaming, and cryptography through focused interactive challenges.",
  },
  {
    icon: Terminal,
    title: "Developer Workflows",
    description:
      "Understand practical protocols, HTTP transactions, Linux commands, and vulnerability identification techniques.",
  },
];

export default function Features() {
  return (
    <section className="border-b border-border bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Platform Capabilities
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Learn Practical Cybersecurity Skills
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            CyberSecDev unites guided theory, realistic virtual labs, interactive games,
            and verified progress tracking into a cohesive learning experience.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-7 shadow-xs transition duration-200 hover:border-slate-300 hover:shadow-md"
            >
              <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <feature.icon className="size-6" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}