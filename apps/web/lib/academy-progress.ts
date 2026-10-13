export interface OrderedLesson {
  id: string;
  slug: string;
}

export interface CourseProgressSummary {
  completedCount: number;
  progress: number;
  completed: boolean;
}

export function summarizeCourseProgress(
  requiredLessonIds: readonly string[],
  completedLessonIds: readonly string[]
): CourseProgressSummary {
  const required = new Set(requiredLessonIds);
  const completed = new Set(completedLessonIds);
  const completedCount = [...required].filter((id) => completed.has(id)).length;

  return {
    completedCount,
    progress: required.size === 0 ? 0 : Math.round((completedCount / required.size) * 100),
    completed: required.size > 0 && completedCount === required.size,
  };
}

export function getCourseResumeHref(
  courseSlug: string,
  orderedLessons: readonly OrderedLesson[],
  completedLessonIds: readonly string[]
): string {
  const completed = new Set(completedLessonIds);
  const nextLesson = orderedLessons.find((lesson) => !completed.has(lesson.id));
  const coursePath = `/academy/${encodeURIComponent(courseSlug)}`;

  return nextLesson
    ? `${coursePath}/lesson/${encodeURIComponent(nextLesson.slug)}`
    : coursePath;
}

export interface LessonProgressUpdate extends CourseProgressSummary {
  alreadyCompleted: boolean;
  completedLessonIds: string[];
}

export function updateLessonProgress(
  currentLessonIds: readonly string[],
  lessonId: string,
  requiredLessonIds: readonly string[]
): LessonProgressUpdate {
  const alreadyCompleted = currentLessonIds.includes(lessonId);
  const completedLessonIds = alreadyCompleted
    ? [...currentLessonIds]
    : [...currentLessonIds, lessonId];

  return {
    alreadyCompleted,
    completedLessonIds,
    ...summarizeCourseProgress(requiredLessonIds, completedLessonIds),
  };
}