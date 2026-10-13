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

  const Lesson = mongoose.model('Lesson', new mongoose.Schema({}, { strict: false }), 'lessons');
  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }), 'courses');

  const course = await Course.findOne({ published: true }).lean();
  if (!course) {
    console.error('No published course found');
    process.exit(1);
  }

  // pick any lesson for the course
  const lesson = await Lesson.findOne({ courseId: course._id }).lean();
  if (!lesson) {
    console.error('No lesson found for course');
    process.exit(1);
  }

  // ensure lesson is published for testing
  await Lesson.updateOne({ _id: lesson._id }, { $set: { published: true } });

  console.log('Using', { courseId: course._id.toString(), lessonId: lesson._id.toString() });

  // Use the dev token observed in server logs
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNDlmNTA1YmQ5Y2NkZjI3YTYxZjQxYiIsImVtYWlsIjoiYWxpY2UxMjNAZ21haWwuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3ODMzMzUwOTgsImV4cCI6MTc4MzkzOTg5OH0.I66qKqeUsqQOHvENucbfzcfecO_Tjp-G9kaNcCg263M';

  const enrollRes = await fetch('http://localhost:3000/api/academy/enroll', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': `token=${token}` },
    body: JSON.stringify({ courseId: course._id.toString() }),
  });

  const enrollJson = await enrollRes.json();
  console.log('Enroll response:', enrollRes.status, enrollJson);

  const completeRes = await fetch('http://localhost:3000/api/academy/progress/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': `token=${token}` },
    body: JSON.stringify({ courseId: course._id.toString(), lessonId: lesson._id.toString() }),
  });

  const completeJson = await completeRes.json();
  console.log('Mark complete response:', completeRes.status, completeJson);

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
