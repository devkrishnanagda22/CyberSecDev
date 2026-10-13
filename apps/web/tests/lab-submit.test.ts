import assert from 'node:assert/strict';
import process from 'node:process';
import { describe, mock, test } from 'node:test';
import mongoose from 'mongoose';
import type { ReactElement } from 'react';

type PostHandler = (request: Request) => Promise<Response>;
type GetHandler = (request: Request) => Promise<Response>;
type DetailHandler = (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => Promise<Response>;

let signToken: typeof import('../lib/jwt').signToken;
let Lab: typeof import('../models/Lab').default;
let User: typeof import('../models/User').default;
let LabProgress: typeof import('../models/LabProgress').default;
let submitLab: PostHandler;
let completeLab: PostHandler;
let listLabs: GetHandler;
let getLabById: DetailHandler;
let labPage: (props: { params: Promise<{ slug: string }> }) => Promise<ReactElement>;
let hashFlag: typeof import('../lib/lab-content').hashFlag;

const authState = { token: '' };
const createdUserIds: mongoose.Types.ObjectId[] = [];
const createdLabIds: mongoose.Types.ObjectId[] = [];

process.loadEnvFile('.env.local');
describe('Lab API integration (dedicated test database)', { skip: !process.env.TEST_MONGODB_URI }, () => {
function setCookieToken(token: string) {
  authState.token = token;
}

function makeAuthRequest(url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});

  if (authState.token) {
    headers.set('cookie', `token=${encodeURIComponent(authState.token)}`);
  }

  return new Request(url, {
    ...init,
    headers,
  });
}

function makeEmail() {
  return `labtest-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

async function createUserWithRole(role: 'student' | 'mentor' | 'admin' = 'student') {
  const email = makeEmail();
  const user = await User.create({
    name: `Lab User ${Math.random().toString(16).slice(2)}`,
    email,
    password: 'hashed-password-value',
    role,
  });
  createdUserIds.push(user._id);

  return user;
}

async function createLab() {
  const slug = `lab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const flag = `FLAG{TEST_${Math.random().toString(16).slice(2).toUpperCase()}}`;

  const lab = await Lab.create({
    title: `Test Lab ${slug}`,
    slug,
    description: 'A safe educational challenge used for automated validation.',
    category: 'Security Basics',
    difficulty: 'Beginner',
    estimatedHours: 0.5,
    instructions: 'Follow the challenge prompt and submit the exact flag value.',
    hints: ['Check the text carefully.', 'Submit the exact flag.'],
    xpReward: 150,
    coinsReward: 25,
    badge: 'Lab Explorer',
    flagHash: await hashFlag(flag),
    tags: ['test', 'lab'],
    published: true,
  });
  createdLabIds.push(lab._id);

  return { lab, flag };
}

test.before(async () => {
  const mongoUri = process.env.TEST_MONGODB_URI;

  if (!mongoUri) {
    throw new Error('TEST_MONGODB_URI is not configured for lab tests.');
  }
  const databaseName = new URL(mongoUri).pathname.split('/').filter(Boolean)[0] ?? '';
  if (!/test/i.test(databaseName)) {
    throw new Error('TEST_MONGODB_URI must target a database with "test" in its name.');
  }
  process.env.MONGODB_URI = mongoUri;

  const [jwtModule, labModule, userModule, progressModule, submitModule, completeModule, labsModule, detailModule, pageModule] = await Promise.all([
    import('../lib/jwt'),
    import('../models/Lab'),
    import('../models/User'),
    import('../models/LabProgress'),
    import('../app/api/labs/submit/route'),
    import('../app/api/labs/complete/route'),
    import('../app/api/labs/route'),
    import('../app/api/labs/[id]/route'),
    import('../app/(labs)/labs/[slug]/page'),
    import('../lib/lab-content'),
  ]);

  signToken = jwtModule.signToken;
  Lab = labModule.default;
  User = userModule.default;
  LabProgress = progressModule.default;
  submitLab = submitModule.POST as unknown as PostHandler;
  completeLab = completeModule.POST as unknown as PostHandler;
  listLabs = labsModule.GET as unknown as GetHandler;
  getLabById = detailModule.GET as unknown as DetailHandler;
  labPage = pageModule.default;
  hashFlag = (await import('../lib/lab-content')).hashFlag;

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
});

test.after(async () => {
  mock.restoreAll();
  await mongoose.disconnect();
});

test.afterEach(async () => {
  mock.restoreAll();
  authState.token = '';
  const userIds = createdUserIds.splice(0);
  const labIds = createdLabIds.splice(0);

  if (userIds.length || labIds.length) {
    await Promise.all([
      LabProgress.deleteMany({ userId: { $in: userIds }, labId: { $in: labIds } }),
      Lab.deleteMany({ _id: { $in: labIds } }),
      User.deleteMany({ _id: { $in: userIds } }),
    ]);
  }
});

test('correct flag accepted', async () => {
  const user = await createUserWithRole('student');
  const { lab, flag } = await createLab();

  setCookieToken(signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  }));

  const response = await submitLab(makeAuthRequest('http://localhost/api/labs/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ labId: lab._id.toString(), flag }),
  }));

  const payload = await response.json();
  const updatedUser = await User.findById(user._id).lean();

  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.xp, lab.xpReward);
  assert.equal(updatedUser.xp, lab.xpReward);
  assert.ok(updatedUser.completedLabs.includes(lab.slug));
  assert.ok(updatedUser.rewardedLabs.some((id: mongoose.Types.ObjectId) => String(id) === lab._id.toString()));
});

test('incorrect flag rejected', async () => {
  const user = await createUserWithRole('student');
  const { lab } = await createLab();

  setCookieToken(signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  }));

  const response = await submitLab(makeAuthRequest('http://localhost/api/labs/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ labId: lab._id.toString(), flag: 'FLAG{WRONG}' }),
  }));

  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.success, false);
  assert.equal(payload.message, 'Incorrect flag');
});

test('unauthenticated submission rejected', async () => {
  const { lab } = await createLab();

  const response = await submitLab(makeAuthRequest('http://localhost/api/labs/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ labId: lab._id.toString(), flag: 'FLAG{ANY}' }),
  }));

  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.success, false);
  assert.equal(payload.message, 'Unauthorized');
});

test('legacy completion endpoint requires a valid flag', async () => {
  const user = await createUserWithRole('student');
  const { lab } = await createLab();

  setCookieToken(signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  }));

  const response = await completeLab(makeAuthRequest('http://localhost/api/labs/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ labId: lab._id.toString() }),
  }));
  const payload = await response.json();
  const progress = await LabProgress.findOne({ userId: user._id, labId: lab._id });

  assert.equal(response.status, 400);
  assert.equal(payload.success, false);
  assert.equal(progress, null);
});

test('public list and detail responses exclude the flag', async () => {
  const { lab, flag } = await createLab();

  const listResponse = await listLabs(makeAuthRequest(`http://localhost/api/labs?published=true`));
  const listPayload = await listResponse.json() as { labs: Array<{ _id: string; flag?: string }> };
  const listLab = listPayload.labs.find((item) => item._id.toString() === lab._id.toString());

  assert.ok(listLab);
  assert.equal(Object.prototype.hasOwnProperty.call(listLab, 'flag'), false);

  const detailResponse = await getLabById(makeAuthRequest(`http://localhost/api/labs/${lab._id.toString()}`), {
    params: Promise.resolve({ id: lab._id.toString() }),
  });
  const detailPayload = await detailResponse.json() as { lab: { flag?: string } };

  assert.equal(detailResponse.status, 200);
  assert.equal(Object.prototype.hasOwnProperty.call(detailPayload.lab, 'flag'), false);
  assert.ok(typeof flag === 'string');
});

test('public lab page props exclude the expected flag', async () => {
  const { lab, flag } = await createLab();

  const page = await labPage({ params: Promise.resolve({ slug: lab.slug }) });

  assert.equal(JSON.stringify(page).includes(flag), false);
});

test('authenticated admins also receive only public lab DTOs', async () => {
  const admin = await createUserWithRole('admin');
  const { lab } = await createLab();

  setCookieToken(signToken({
    id: admin._id.toString(),
    email: admin.email,
    role: admin.role,
  }));

  const listResponse = await listLabs(makeAuthRequest('http://localhost/api/labs?published=true'));
  const listPayload = await listResponse.json() as { labs: Array<{ _id: string; flag?: string }> };
  const listLab = listPayload.labs.find((item) => item._id.toString() === lab._id.toString());

  const detailResponse = await getLabById(makeAuthRequest(`http://localhost/api/labs/${lab._id.toString()}`), {
    params: Promise.resolve({ id: lab._id.toString() }),
  });
  const detailPayload = await detailResponse.json();

  assert.ok(listLab);
  assert.equal(Object.prototype.hasOwnProperty.call(listLab, 'flag'), false);
  assert.equal(detailResponse.status, 200);
  assert.equal(Object.prototype.hasOwnProperty.call(detailPayload.lab, 'flag'), false);
});

test('repeated submissions do not award rewards again', async () => {
  const user = await createUserWithRole('student');
  const { lab, flag } = await createLab();

  setCookieToken(signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  }));

  const first = await submitLab(makeAuthRequest('http://localhost/api/labs/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ labId: lab._id.toString(), flag }),
  }));

  const second = await submitLab(makeAuthRequest('http://localhost/api/labs/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ labId: lab._id.toString(), flag }),
  }));

  const firstPayload = await first.json();
  const secondPayload = await second.json();
  const updatedUser = await User.findById(user._id).lean();

  assert.equal(firstPayload.success, true);
  assert.equal(secondPayload.success, true);
  assert.equal(secondPayload.alreadyCompleted, true);
  assert.equal(updatedUser.xp, lab.xpReward);
  assert.equal(updatedUser.coins, 100 + lab.coinsReward);
});

test('changing a lab slug does not allow a second reward', async () => {
  const user = await createUserWithRole('student');
  const { lab, flag } = await createLab();

  setCookieToken(signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  }));

  await submitLab(makeAuthRequest('http://localhost/api/labs/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ labId: lab._id.toString(), flag }),
  }));

  const newSlug = `${lab.slug}-renamed`;
  await Lab.updateOne({ _id: lab._id }, { $set: { slug: newSlug } });

  const response = await submitLab(makeAuthRequest('http://localhost/api/labs/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ labId: lab._id.toString(), flag }),
  }));
  const payload = await response.json();
  const updatedUser = await User.findById(user._id).lean();

  assert.equal(payload.alreadyCompleted, true);
  assert.equal(updatedUser.xp, lab.xpReward);
  assert.equal(updatedUser.coins, 100 + lab.coinsReward);
});

test('concurrent duplicate submissions do not award duplicate rewards', async () => {
  const user = await createUserWithRole('student');
  const { lab, flag } = await createLab();

  setCookieToken(signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  }));

  const requests = Array.from({ length: 2 }, () =>
    submitLab(makeAuthRequest('http://localhost/api/labs/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labId: lab._id.toString(), flag }),
    }))
  );

  const responses = await Promise.all(requests);
  const payloads = await Promise.all(responses.map((response) => response.json()));
  const updatedUser = await User.findById(user._id).lean();

  assert.equal(payloads.filter((item) => item.success && !item.alreadyCompleted).length, 1);
  assert.equal(updatedUser.xp, lab.xpReward);
  assert.equal(updatedUser.coins, 100 + lab.coinsReward);
  assert.equal(updatedUser.completedLabs.filter((slug: string) => slug === lab.slug).length, 1);
});

test('completion persists and survives reload', async () => {
  const user = await createUserWithRole('student');
  const { lab, flag } = await createLab();

  setCookieToken(signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  }));

  const response = await submitLab(makeAuthRequest('http://localhost/api/labs/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ labId: lab._id.toString(), flag }),
  }));

  const payload = await response.json();
  const progress = await LabProgress.findOne({
    userId: user._id,
    labId: lab._id,
  }).lean();

  assert.equal(payload.success, true);
  assert.equal(progress.completed, true);
  assert.equal(progress.progress, 100);
  assert.ok(progress.completedAt instanceof Date);
});
});
