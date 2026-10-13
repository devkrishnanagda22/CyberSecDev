import Link from "next/link";
import {
  Gamepad2,
  Globe,
  Bug,
  Shield,
  KeyRound,
  Network,
  ArrowRight,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

const games = [
  {
    icon: Globe,
    title: "Web Security Missions",
    difficulty: "Beginner",
    xp: "100 XP",
    time: "20 mins",
    description: "Identify and defend common web weaknesses including XSS, SQL injection, and insecure headers.",
  },
  {
    icon: Bug,
    title: "Bug Bounty Simulator",
    difficulty: "Intermediate",
    xp: "250 XP",
    time: "45 mins",
    description: "Navigate simulated web targets to spot security oversights and verify reproduction steps.",
  },
  {
    icon: Shield,
    title: "Blue Team Defender",
    difficulty: "Intermediate",
    xp: "180 XP",
    time: "30 mins",
    description: "Analyze simulated intrusion attempts and configure protective safeguards.",
  },
  {
    icon: KeyRound,
    title: "Applied Cryptography",
    difficulty: "Beginner",
    xp: "120 XP",
    time: "25 mins",
    description: "Explore cryptographic hashes, symmetric and asymmetric ciphers, and encoding schemes.",
  },
  {
    icon: Network,
    title: "Networking Lab",
    difficulty: "Beginner",
    xp: "150 XP",
    time: "30 mins",
    description: "Examine packet flows, DNS queries, routing principles, and network port states.",
  },
  {
    icon: Gamepad2,
    title: "CTF Security Arena",
    difficulty: "Advanced",
    xp: "500 XP",
    time: "60 mins",
    description: "Engage in timed Capture The Flag challenge series with instant flag verification.",
  },
];

export default function Games() {
  return (
    <section className="border-b border-border bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Hands-on Gamification
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Learn Cybersecurity by Playing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Engage with interactive missions designed to build muscle memory
            and reinforce conceptual understanding through practical challenges.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <div
              key={game.title}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-7 shadow-xs transition duration-200 hover:border-slate-300 hover:shadow-md"
            >
              <div>
                <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-primary">
                  <game.icon className="size-6" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  {game.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {game.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                    {game.difficulty}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                    {game.xp}
                  </span>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">
                    {game.time}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/games"
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full justify-center shadow-2xs font-semibold hover:border-primary hover:text-primary",
                  })}
                >
                  Play Game
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