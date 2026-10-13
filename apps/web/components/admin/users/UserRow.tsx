import { Shield, User, GraduationCap } from "lucide-react";

interface UserRowProps {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    level: number;
    xp: number;
    coins: number;
    isActive: boolean;
  };
}

export default function UserRow({ user }: UserRowProps) {
  const roleIcon =
    user.role === "admin" ? (
      <Shield className="h-4 w-4 text-red-400" />
    ) : user.role === "mentor" ? (
      <GraduationCap className="h-4 w-4 text-green-400" />
    ) : (
      <User className="h-4 w-4 text-cyan-400" />
    );

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-900">
      <td className="px-4 py-3 font-medium text-white">
        {user.name}
      </td>

      <td className="px-4 py-3 text-gray-300">
        {user.email}
      </td>

      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-sm">
          {roleIcon}
          {user.role}
        </span>
      </td>

      <td className="px-4 py-3 text-center">
        {user.level}
      </td>

      <td className="px-4 py-3 text-center">
        {user.xp}
      </td>

      <td className="px-4 py-3 text-center">
        {user.coins}
      </td>

      <td className="px-4 py-3">
        <span
          className={`rounded-full px-3 py-1 text-sm ${
            user.isActive
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {user.isActive ? "Active" : "Inactive"}
        </span>
      </td>
    </tr>
  );
}