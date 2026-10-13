const fs = require('fs');
const mongoose = require('mongoose');

function loadEnv() {
  const envPath = './.env.local';
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const env = {};
  lines.forEach(line => {
    const m = line.match(/^(\w+)=([\s\S]*)$/);
    if (m) env[m[1]] = m[2];
  });
  return env;
}

async function main() {
  const env = loadEnv();
  const uri = env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  await mongoose.connect(uri);

  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }), 'courses');
  const Lesson = mongoose.model('Lesson', new mongoose.Schema({}, { strict: false }), 'lessons');

  const course = await Course.findOne({ published: true }).lean();
  if (!course) {
    console.error('No published course found');
    process.exit(1);
  }

  const totalLessons = await Lesson.countDocuments();
  const lessonsForCourseObjId = await Lesson.findOne({ courseId: course._id, published: true }).lean();
  const lessonsForCourseString = await Lesson.findOne({ courseId: course._id.toString(), published: true }).lean();

  const anyLesson = await Lesson.findOne({}).lean();

  console.log(JSON.stringify({ courseId: course._id.toString(), courseSlug: course.slug, totalLessons, lessonByObjectId: lessonsForCourseObjId ? { id: lessonsForCourseObjId._id.toString(), slug: lessonsForCourseObjId.slug } : null, lessonByString: lessonsForCourseString ? { id: lessonsForCourseString._id.toString(), slug: lessonsForCourseString.slug } : null, anyLesson }, null, 2));

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
