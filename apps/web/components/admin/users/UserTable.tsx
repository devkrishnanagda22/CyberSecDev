import UserRow from "./UserRow";

interface UserTableProps {
  users: any[];
}

export default function UserTable({
  users,
}: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900">
      <table className="w-full">
        <thead className="bg-slate-800">
          <tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Role</th>
            <th className="px-4 py-3 text-center">Level</th>
            <th className="px-4 py-3 text-center">XP</th>
            <th className="px-4 py-3 text-center">Coins</th>
            <th className="px-4 py-3 text-center">Status</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <UserRow
              key={user._id}
              user={user}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}