import {
  FlaskConical,
  Trophy,
  Gamepad2,
  BookOpen,
} from "lucide-react";

type ActivityType = "course" | "lab" | "game";

type ActivityItem = {
  type: ActivityType;
  title: string;
  occurredAt: string;
  meta?: string;
};

interface ActivityTimelineProps {
  activities?: ActivityItem[];
  loading?: boolean;
}

function formatActivityTime(value: string): string {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const typeStyles: Record<ActivityType, string> = {
  course: "bg-indigo-50 text-primary",
  lab: "bg-emerald-50 text-emerald-600",
  game: "bg-purple-50 text-purple-600",
};

const typeIcons: Record<ActivityType, typeof FlaskConical> = {
  course: BookOpen,
  lab: FlaskConical,
  game: Gamepad2,
};

export default function ActivityTimeline({
  activities = [],
  loading = false,
}: ActivityTimelineProps) {
  if (loading) {
    return (
      <section className="mt-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Activity Timeline</h2>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 text-sm text-slate-500">
          Loading activity...
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Activity Timeline</h2>
        <button className="text-sm font-semibold text-primary hover:text-indigo-700 transition">View All</button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
        {activities.length === 0 ? (
          <div className="text-sm text-slate-500">No recent activity yet.</div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity, index) => {
              const Icon = typeIcons[activity.type] ?? Trophy;

              return (
                <div key={`${activity.type}-${activity.title}-${index}`} className="flex items-start gap-4">
                  <div className={`rounded-full p-2.5 ${typeStyles[activity.type] ?? "bg-slate-100 text-slate-600"}`}>
                    <Icon size={20} />
                  </div>

                  <div className="flex-1 border-b border-border pb-5 last:border-b-0 last:pb-0">
                    <h3 className="font-semibold text-slate-900">{activity.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatActivityTime(activity.occurredAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}