import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
process.loadEnvFile(path.resolve(scriptDirectory, '../.env.local'));

const [mongooseModule, courseModule, lessonModule] = await Promise.all([
  import('mongoose'),
  import('../models/Course.ts'),
  import('../models/Lesson.ts'),
]);

const mongoose = mongooseModule.default;
const Course = courseModule.default;
const Lesson = lessonModule.default;

const COURSE_SLUG = 'advanced-web-security';
const LESSON_SLUG = 'abc';
const LESSON_TITLE = 'How the Web Works: Requests, Responses, Cookies and Sessions';
const LESSON_DURATION_MINUTES = 40;
const CONTENT_PATH = path.resolve(scriptDirectory, '../content/academy/how-the-web-works.md');

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not configured.');
  }

  const content = (await readFile(CONTENT_PATH, 'utf8')).trim();

  if (!content.startsWith(`# ${LESSON_TITLE}`)) {
    throw new Error('Lesson content title does not match the target lesson.');
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

  const courses = await Course.find({ slug: COURSE_SLUG, published: true })
    .select('_id slug published')
    .lean();

  if (courses.length !== 1) {
    throw new Error('Expected exactly one published course for the verified slug.');
  }

  const course = courses[0];
  const lessons = await Lesson.find({
    courseId: course._id,
    slug: LESSON_SLUG,
    published: true,
  })
    .select('_id courseId slug published')
    .lean();

  if (lessons.length !== 1) {
    throw new Error('Expected exactly one published lesson related to the verified course.');
  }

  const lesson = lessons[0];
  const update = await Lesson.updateOne(
    {
      _id: lesson._id,
      courseId: course._id,
      slug: LESSON_SLUG,
      published: true,
    },
    {
      $set: {
        title: LESSON_TITLE,
        content,
        duration: LESSON_DURATION_MINUTES,
      },
    }
  );

  if (update.matchedCount !== 1) {
    throw new Error('The verified lesson no longer matches the update selector.');
  }

  const updatedLesson = await Lesson.findById(lesson._id)
    .select('_id courseId slug title published duration xpReward content')
    .lean();

  if (
    !updatedLesson ||
    String(updatedLesson.courseId) !== String(course._id) ||
    updatedLesson.slug !== LESSON_SLUG ||
    updatedLesson.title !== LESSON_TITLE ||
    updatedLesson.published !== true ||
    updatedLesson.duration !== LESSON_DURATION_MINUTES ||
    updatedLesson.content !== content
  ) {
    throw new Error('Updated lesson verification failed.');
  }

  console.log(JSON.stringify({
    updated: true,
    courseSlug: COURSE_SLUG,
    lessonSlug: LESSON_SLUG,
    title: LESSON_TITLE,
    durationMinutes: LESSON_DURATION_MINUTES,
    contentCharacters: content.length,
    publicationPreserved: updatedLesson.published,
    xpRewardPreserved: updatedLesson.xpReward,
    identifierPreserved: String(updatedLesson._id) === String(lesson._id),
  }));
}

try {
  await main();
} catch (error) {
  console.error('Lesson update failed:', error instanceof Error ? error.message : 'Unexpected error.');
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}