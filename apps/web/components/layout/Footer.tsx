import Link from "next/link";
import { Shield } from "lucide-react";

const footerLinks = [
  { href: "/academy", label: "Academy" },
  { href: "/labs", label: "Labs" },
  { href: "/games", label: "Games" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold text-foreground">
            <Shield className="size-5 text-primary" aria-hidden="true" />
            CyberSecDev
          </Link>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            A place to learn cybersecurity fundamentals and practice with guided lessons, labs, and challenges.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-600 transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} CyberSecDev
        </p>
      </div>
    </footer>
  );
}
