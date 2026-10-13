"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Home,
  BookOpen,
  Gamepad2,
  FlaskConical,
  Trophy,
  Settings,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      const data = await res.json();

      if (data.success) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <aside className="hidden lg:flex w-64 min-h-[calc(100vh-4rem)] flex-col border-r border-border bg-white p-5">
      <div className="mb-6 px-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <NavItem
          href="/dashboard"
          icon={<Home size={18} />}
          label="Overview"
        />

        <NavItem
          href="/academy"
          icon={<BookOpen size={18} />}
          label="Academy"
        />

        <NavItem
          href="/games"
          icon={<Gamepad2 size={18} />}
          label="Games"
        />

        <NavItem
          href="/labs"
          icon={<FlaskConical size={18} />}
          label="Labs"
        />

        <NavItem
          href="/leaderboard"
          icon={<Trophy size={18} />}
          label="Leaderboard"
        />
      </nav>

      {/* Bottom */}
      <div className="space-y-1 border-t border-slate-100 pt-4">
        <NavItem
          href="/admin/settings"
          icon={<Settings size={18} />}
          label="Settings"
        />

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
    >
      <span className="text-slate-500">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}