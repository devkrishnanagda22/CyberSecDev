import { requireAdmin } from "@/lib/server-auth";
import CourseForm from "@/components/admin/courses/CourseForm";

export default async function NewCoursePage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">
            Create New Course
          </h1>

          <p className="mt-2 text-gray-400">
            Add a new cybersecurity course to the platform.
          </p>
        </div>

        <CourseForm mode="create" />
      </div>
    </main>
  );
}