"use client";

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url, { credentials: "same-origin" }).then(r => r.json());

export default function Analytics() {
  const { data, error } = useSWR('/api/admin/analytics', fetcher);

  if (error) return <div>Error loading analytics.</div>;
  if (!data) return <div>Loading...</div>;

  const m = data.metrics || {};

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Admin Analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded bg-white p-3 shadow">
          <div className="text-sm text-muted-foreground">Total Users</div>
          <div className="text-2xl font-bold">{m.totalUsers}</div>
        </div>
        <div className="rounded bg-white p-3 shadow">
          <div className="text-sm text-muted-foreground">Active Users</div>
          <div className="text-2xl font-bold">{m.activeUsers}</div>
        </div>
        <div className="rounded bg-white p-3 shadow">
          <div className="text-sm text-muted-foreground">Enrollments</div>
          <div className="text-2xl font-bold">{m.totalEnrollments}</div>
        </div>
        <div className="rounded bg-white p-3 shadow">
          <div className="text-sm text-muted-foreground">Avg Progress</div>
          <div className="text-2xl font-bold">{m.avgProgress}%</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded bg-white p-4 shadow">
          <h3 className="font-semibold mb-2">Top Courses</h3>
          <ol className="space-y-2">
            {m.topCourses?.map((c: any, i: number) => (
              <li key={c.courseId} className="flex items-center justify-between">
                <div>{i + 1}. {c.title}</div>
                <div className="text-sm text-muted-foreground">{c.enrollments} enroll • {c.avgProgress}%</div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded bg-white p-4 shadow">
          <h3 className="font-semibold mb-2">Other Metrics</h3>
          <div>Total Lessons: {m.totalLessons}</div>
          <div>Total Labs: {m.totalLabs}</div>
          <div>Games: {m.totalGames}</div>
          <div>Game Scores: {m.totalScores}</div>
        </div>
      </div>
    </div>
  );
}
