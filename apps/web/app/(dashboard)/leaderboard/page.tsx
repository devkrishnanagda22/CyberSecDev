import Leaderboard from "@/components/ui/Leaderboard";

export default function Page() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 bg-card rounded p-4">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}
