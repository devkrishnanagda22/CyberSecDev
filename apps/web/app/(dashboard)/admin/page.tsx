import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
} from "lucide-react";

import { requireAdmin } from "@/lib/server-auth";
import { connectDB } from "@/lib/mongodb";

import User from "@/models/User";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Progress from "@/models/Progress";

import AdminStatCard from "@/components/admin/AdminStatCard";

export default async function AdminPage() {
  await connectDB();

  const admin = await requireAdmin();

  const [
    totalUsers,
    totalCourses,
    totalLessons,
    totalProgress,
  ] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Lesson.countDocuments(),
    Progress.countDocuments(),
  ]);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">

        <h1 className="text-4xl font-bold text-cyan-400">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-gray-400">
          Welcome back, {admin.name}
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <AdminStatCard
            title="Total Users"
            value={totalUsers}
            icon={<Users size={28} />}
          />

          <AdminStatCard
            title="Courses"
            value={totalCourses}
            icon={<BookOpen size={28} />}
            color="text-green-400"
          />

          <AdminStatCard
            title="Lessons"
            value={totalLessons}
            icon={<GraduationCap size={28} />}
            color="text-yellow-400"
          />

          <AdminStatCard
            title="Progress Records"
            value={totalProgress}
            icon={<TrendingUp size={28} />}
            color="text-purple-400"
          />

        </div>
      </div>
    </main>
  );
}