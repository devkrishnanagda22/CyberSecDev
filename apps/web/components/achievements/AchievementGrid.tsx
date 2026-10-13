"use client";

import AchievementCard from "./AchievementCard";
import { achievements } from "./achievementData";

export default function AchievementGrid() {
  return (
    <section className="space-y-8">

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-white">
            Achievements
          </h1>

          <p className="mt-2 text-gray-400">
            Unlock achievements by completing courses, labs and games.
          </p>
        </div>

        <div className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-black">
          {achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked
        </div>

      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
          />
        ))}

      </div>

    </section>
  );
}