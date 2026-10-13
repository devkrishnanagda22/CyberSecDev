"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import useUser from "@/hooks/useUser";

export default function Topbar() {
  const { user, loading } = useUser();

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-6 border-b border-border">
      {/* Left */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {loading ? "Loading..." : `Welcome, ${user?.name}`}
        </h1>

        <p className="mt-1 text-sm text-slate-500 capitalize">
          {loading
            ? "Loading profile..."
            : `${user?.role || "Learner"} • Keep learning cybersecurity`}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative w-64 sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-2.5 text-slate-400"
          />

          <Input
            placeholder="Search labs, games..."
            className="h-9 pl-9 bg-white"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-lg border border-border bg-white p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 shadow-2xs"
        >
          <Bell size={18} />
        </button>

        {/* Avatar */}
        <Avatar className="h-9 w-9 border border-indigo-200">
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback className="bg-indigo-50 font-bold text-primary text-xs">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}