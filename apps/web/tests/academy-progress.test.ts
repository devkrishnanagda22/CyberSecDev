import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getCourseResumeHref,
  summarizeCourseProgress,
  updateLessonProgress,
} from "../lib/academy-progress";

const lessons = [
  { id: "lesson-1", slug: "intro" },
  { id: "lesson-2", slug: "requests" },
  { id: "lesson-3", slug: "responses" },
];

test("empty progress starts at the first lesson without completing an empty course", () => {
  assert.deepEqual(summarizeCourseProgress([], []), {
    completedCount: 0,
    progress: 0,
    completed: false,
  });
  assert.equal(getCourseResumeHref("web-security", lessons, []), "/academy/web-security/lesson/intro");
});

test("in-progress courses resume at the first incomplete lesson in course order", () => {
  const summary = summarizeCourseProgress(
    lessons.map((lesson) => lesson.id),
    ["lesson-1", "stale-lesson-id"]
  );

  assert.deepEqual(summary, {
    completedCount: 1,
    progress: 33,
    completed: false,
  });
  assert.equal(
    getCourseResumeHref("web-security", lessons, ["lesson-1"]),
    "/academy/web-security/lesson/requests"
  );
});

test("completed courses report completion and resume at the course overview", () => {
  const ids = lessons.map((lesson) => lesson.id);

  assert.deepEqual(summarizeCourseProgress(ids, ids), {
    completedCount: 3,
    progress: 100,
    completed: true,
  });
  assert.equal(
    getCourseResumeHref("web-security", lessons, ids),
    "/academy/web-security"
  );
});

test("course edits recalculate progress against current required lessons", () => {
  const currentLessons = [lessons[0], { id: "lesson-4", slug: "new-topic" }];

  assert.deepEqual(
    summarizeCourseProgress(
      currentLessons.map((lesson) => lesson.id),
      ["lesson-1", "lesson-2", "lesson-3"]
    ),
    {
      completedCount: 1,
      progress: 50,
      completed: false,
    }
  );
});

test("repeating a lesson completion does not create a second reward opportunity", () => {
  const first = updateLessonProgress([], "lesson-1", lessons.map((lesson) => lesson.id));
  const repeated = updateLessonProgress(
    first.completedLessonIds,
    "lesson-1",
    lessons.map((lesson) => lesson.id)
  );

  assert.equal(first.alreadyCompleted, false);
  assert.equal(repeated.alreadyCompleted, true);
  assert.deepEqual(repeated.completedLessonIds, ["lesson-1"]);
  assert.equal(repeated.completedCount, 1);
});