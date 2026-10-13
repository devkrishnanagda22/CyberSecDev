const path = require('node:path');
const { randomBytes, scryptSync } = require('node:crypto');

process.loadEnvFile(path.resolve(__dirname, '../.env.local'));

const mongoose = require('mongoose');

const LabModule = require('../models/Lab.ts');
const Lab = LabModule.default || LabModule;

const slug = 'intro-event-log-triage';

function hashFlag(flag) {
  const salt = randomBytes(16);
  const hash = scryptSync(flag, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  const flag = process.env.LAB_EVENT_LOG_FLAG;

  if (!uri) {
    throw new Error('MONGODB_URI is not configured.');
  }
  if (!flag?.trim()) {
    throw new Error('LAB_EVENT_LOG_FLAG is not configured.');
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

  const existing = await Lab.findOne({ slug }).lean();

  if (existing) {
    console.log(`Lab already exists: ${slug}`);
    return;
  }

  await Lab.create({
    title: 'Intro Event Log Triage',
    slug,
    description: 'Triage a short authentication log, identify a password-spray alert, and reconstruct its challenge token.',
    category: 'Security Fundamentals',
    difficulty: 'Beginner',
    estimatedHours: 0.5,
    instructions: [
      '## Learning objective',
      'Recognize a password-spray pattern by correlating failed sign-ins across several accounts from one source.',
      '',
      '## Evidence',
      '```text',
      '08:14:02 user=alex    source=198.51.100.24  result=success',
      '08:15:10 user=admin   source=203.0.113.77   result=failed',
      '08:15:24 user=backup  source=203.0.113.77   result=failed',
      '08:15:39 user=student source=203.0.113.77   result=failed',
      '08:15:40 alert=password-spray source=203.0.113.77 alert_id=7319',
      '```',
      '',
      '## Task',
      'Find the alert identifier associated with the repeated failures. Submit it in this format: `FLAG{AUTH_SPRAY_<alert_id>}`.',
    ].join('\n'),
    hints: [
      'Compare the source values on the failed sign-ins; the successful event is unrelated.',
      'Several different accounts fail from the same source in a short time window. This is the password-spray pattern.',
      'Use the alert_id on the password-spray event and place it into the format shown in the task.',
    ],
    xpReward: 150,
    coinsReward: 25,
    badge: 'Lab Explorer',
    flagHash: hashFlag(flag.trim()),
    tags: ['logging', 'forensics', 'beginner'],
    published: true,
  });

  console.log(`Seeded playable lab: ${slug}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
