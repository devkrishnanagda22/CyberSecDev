"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, Shield, X } from "lucide-react";

import useUser from "@/hooks/useUser";

const links = [
  { href: "/", label: "Home" },
  { href: "/academy", label: "Academy" },
  { href: "/labs", label: "Labs" },
  { href: "/games", label: "Games" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, refreshUser } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  async function logout() {
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to log out.");
      }
      await refreshUser();
      setMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutError("Unable to log out. Please try again.");
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function active(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-md text-lg font-bold tracking-tight text-foreground focus-visible:outline-offset-4">
          <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-primary">
            <Shield className="size-5" aria-hidden="true" />
          </span>
          <span>CyberSecDev</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active(link.href) ? "page" : undefined}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                active(link.href)
                  ? "bg-indigo-50 text-primary font-semibold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden min-w-48 items-center justify-end gap-2 md:flex">
          {loading ? (
            <div aria-label="Loading account" className="h-9 w-32 animate-pulse rounded-md bg-slate-100" />
          ) : user ? (
            <>
              <Link
                href={user.role === "admin" ? "/admin" : "/dashboard"}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                {user.role === "admin" ? "Admin" : "Dashboard"}
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="min-h-9 rounded-md border border-border px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900">
                Log in
              </Link>
              <Link href="/register" className="inline-flex min-h-9 items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-indigo-700">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {logoutError ? (
        <p role="alert" className="border-t border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-700">
          {logoutError}
        </p>
      ) : null}

      {menuOpen ? (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="border-t border-border bg-white px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active(link.href) ? "page" : undefined}
                onClick={closeMenu}
                className={`min-h-11 rounded-md px-3 py-2.5 text-sm font-medium ${
                  active(link.href) ? "bg-indigo-50 text-primary font-semibold" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-border pt-3">
              {loading ? (
                <span className="py-2 text-sm text-muted-foreground">Loading account…</span>
              ) : user ? (
                <>
                  <Link href={user.role === "admin" ? "/admin" : "/dashboard"} onClick={closeMenu} className="min-h-11 flex-1 rounded-md border border-border px-3 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-100">
                    {user.role === "admin" ? "Admin" : "Dashboard"}
                  </Link>
                  <button type="button" onClick={() => void logout()} className="min-h-11 flex-1 rounded-md border border-border px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMenu} className="min-h-11 flex-1 rounded-md border border-border px-3 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-100">
                    Log in
                  </Link>
                  <Link href="/register" onClick={closeMenu} className="min-h-11 flex-1 rounded-md bg-primary px-3 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-700">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
