import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/server-auth";

import User from "@/models/User";

import UserTable from "@/components/admin/users/UserTable";

export default async function AdminUsersPage() {
  await connectDB();
  await requireAdmin();

  const users = await User.find({})
    .select("-password")
    .sort({
      createdAt: -1,
    })
    .lean();

  const serializedUsers = users.map((user: any) => ({
    ...user,
    _id: user._id.toString(),
  }));

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">
            User Management
          </h1>

          <p className="mt-2 text-gray-400">
            Manage all registered CyberSecDev users.
          </p>
        </div>

        <UserTable users={serializedUsers} />

      </div>
    </main>
  );
}