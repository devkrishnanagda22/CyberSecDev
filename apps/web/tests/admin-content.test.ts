import assert from "node:assert/strict";
import { describe, mock, test } from "node:test";
import process from "node:process";
import mongoose from "mongoose";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

type Handler = (request: Request) => Promise<Response>;
type ItemHandler = (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => Promise<Response>;

process.loadEnvFile(".env.local");
const testDatabaseUri = process.env.TEST_MONGODB_URI;

describe(
  "Admin content routes (dedicated test database)",
  { skip: !testDatabaseUri },
  () => {
    let signToken: typeof import("../lib/jwt").signToken;
    let Course: typeof import("../models/Course").default;
    let Lesson: typeof import("../models/Lesson").default;
    let Lab: typeof import("../models/Lab").default;
    let User: typeof import("../models/User").default;
    let Progress: typeof import("../models/Progress").default;
    let createCourse: Handler;
    let updateCourse: ItemHandler;
    let createLesson: Handler;
    let updateLesson: Handler;
    let createLab: Handler;
    let listCourses: () => Promise<Response>;
    let listLabs: (request: Request) => Promise<Response>;
    let testLabConfig: ItemHandler;
    let academyCoursePage: (props: {
      params: Promise<{ slug: string }>;
    }) => Promise<ReactElement>;

    const users: mongoose.Types.ObjectId[] = [];
    const courses: mongoose.Types.ObjectId[] = [];
    const lessons: mongoose.Types.ObjectId[] = [];
    const labs: mongoose.Types.ObjectId[] = [];
    let requestToken = "";
    let sequence = 0;

    function makeRequest(url: string, body?: unknown): Request {
      const headers = new Headers();
      if (body !== undefined) headers.set("content-type", "application/json");
      if (requestToken) headers.set("cookie", `token=${encodeURIComponent(requestToken)}`);
      return new Request(url, {
        method: body === undefined ? "GET" : "POST",
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    }

    async function createUser(role: "student" | "admin" = "student") {
      const user = await User.create({
        name: "Admin content test",
        email: `admin-content-${Date.now()}-${Math.random()}@example.test`,
        password: "test-hash",
        role,
      });
      users.push(user._id);
      requestToken = signToken({
        id: user._id.toString(),
        email: user.email,
        role: "admin",
      });
      return user;
    }

    function nextSlug(prefix: string) {
      sequence += 1;
      return `${prefix}-test-${Date.now()}-${sequence}`;
    }

    test.before(async () => {
      const uri = process.env.TEST_MONGODB_URI;
      if (!uri) throw new Error("TEST_MONGODB_URI is required.");
      const databaseName = new URL(uri).pathname.split("/").filter(Boolean)[0] ?? "";
      if (!/test/i.test(databaseName)) {
        throw new Error('TEST_MONGODB_URI must target a database with "test" in its name.');
      }
      process.env.MONGODB_URI = uri;

      const [
        jwtModule,
        courseModel,
        lessonModel,
        labModel,
        userModel,
        progressModel,
        courseRoutes,
        courseItemRoute,
        lessonRoutes,
        labRoutes,
        publicCourses,
        labTestRoute,
        academyCoursePageModule,
      ] = await Promise.all([
        import("../lib/jwt"),
        import("../models/Course"),
        import("../models/Lesson"),
        import("../models/Lab"),
        import("../models/User"),
        import("../models/Progress"),
        import("../app/api/admin/courses/route"),
        import("../app/api/admin/courses/[id]/route"),
        import("../app/api/admin/lessons/route"),
        import("../app/api/admin/labs/route"),
        import("../app/api/academy/courses/route"),
        import("../app/api/admin/labs/[id]/test/route"),
        import("../app/(academy)/academy/[slug]/page"),
      ]);

      signToken = jwtModule.signToken;
      Course = courseModel.default;
      Lesson = lessonModel.default;
      Lab = labModel.default;
      User = userModel.default;
      Progress = progressModel.default;
      createCourse = courseRoutes.POST as unknown as Handler;
      updateCourse = courseItemRoute.PUT as unknown as ItemHandler;
      createLesson = lessonRoutes.POST as unknown as Handler;
      updateLesson = lessonRoutes.PATCH as unknown as Handler;
      createLab = labRoutes.POST as unknown as Handler;
      listCourses = publicCourses.GET;
      listLabs = labRoutes.GET as unknown as (request: Request) => Promise<Response>;
      testLabConfig = labTestRoute.POST as unknown as ItemHandler;
      academyCoursePage = academyCoursePageModule.default;

      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    });

    test.after(async () => {
      mock.restoreAll();
      await mongoose.disconnect();
    });

    test.afterEach(async () => {
      requestToken = "";
      const userIds = users.splice(0);
      const courseIds = courses.splice(0);
      const lessonIds = lessons.splice(0);
      const labIds = labs.splice(0);
      await Promise.all([
        Progress.deleteMany({
          userId: { $in: userIds },
          courseId: { $in: courseIds },
        }),
        Lesson.deleteMany({ _id: { $in: lessonIds } }),
        Lab.deleteMany({ _id: { $in: labIds } }),
        Course.deleteMany({ _id: { $in: courseIds } }),
        User.deleteMany({ _id: { $in: userIds } }),
      ]);
    });

    test("anonymous and normal users cannot create admin content", async () => {
      const payload = {
        title: "Restricted course",
        slug: nextSlug("restricted"),
        description: "Must not be created.",
        category: "Testing",
      };
      const anonymous = await createCourse(
        makeRequest("http://localhost/api/admin/courses", payload)
      );
      assert.equal(anonymous.status, 401);

      await createUser("student");
      const normalUser = await createCourse(
        makeRequest("http://localhost/api/admin/courses", payload)
      );
      assert.equal(normalUser.status, 403);
      assert.equal(await Course.countDocuments({ slug: payload.slug }), 0);
    });

    test("admins can create and edit courses without replacing IDs or progress", async () => {
      const admin = await createUser("admin");
      const slug = nextSlug("academy");
      const created = await createCourse(
        makeRequest("http://localhost/api/admin/courses", {
          title: "Editable course",
          slug,
          description: "Course summary",
          category: "Web",
          published: true,
        })
      );
      assert.equal(created.status, 201);
      const createdBody = await created.json();
      const courseId = createdBody.course._id as string;
      courses.push(new mongoose.Types.ObjectId(courseId));
      await Progress.create({
        userId: admin._id,
        courseId,
        completedLessons: ["retained-lesson-id"],
        progress: 50,
        completed: false,
      });

      const updated = await updateCourse(
        makeRequest("http://localhost/api/admin/courses", {
          title: "Updated course",
          slug,
          description: "Updated summary",
          category: "Web",
          difficulty: "Intermediate",
          xpReward: 100,
          estimatedHours: 3,
          published: true,
          thumbnail: "",
        }),
        { params: Promise.resolve({ id: courseId }) }
      );
      assert.equal(updated.status, 200);
      const updatedBody = await updated.json();
      assert.equal(updatedBody.course._id, courseId);

      const progress = await Progress.findOne({ userId: admin._id, courseId }).lean();
      assert.deepEqual(progress?.completedLessons, ["retained-lesson-id"]);
      assert.equal(progress?.progress, 50);

      const publicResponse = await listCourses();
      const publicBody = await publicResponse.json();
      assert.ok(publicBody.courses.some((course: { slug: string }) => course.slug === slug));
    });

    test("admins can create and edit lessons while drafts remain unpublished", async () => {
      await createUser("admin");
      const course = await Course.create({
        title: "Lesson test course",
        slug: nextSlug("lesson-course"),
        description: "Summary",
        category: "Web",
        published: true,
      });
      courses.push(course._id);

      const lessonSlug = nextSlug("draft-lesson");
      const created = await createLesson(
        makeRequest("http://localhost/api/admin/lessons", {
          courseId: course._id.toString(),
          title: "Draft lesson",
          slug: lessonSlug,
          content: "## Safe markdown\n\n<script>alert(1)</script>",
          order: 1,
          videoUrl: "",
          duration: 10,
          xpReward: 50,
          published: false,
        })
      );
      assert.equal(created.status, 201);
      const createdBody = await created.json();
      const lessonId = createdBody.lesson._id as string;
      lessons.push(new mongoose.Types.ObjectId(lessonId));

      const draftPage = await academyCoursePage({
        params: Promise.resolve({ slug: course.slug }),
      });
      assert.equal(renderToStaticMarkup(draftPage).includes("Draft lesson"), false);

      const updated = await updateLesson(
        makeRequest("http://localhost/api/admin/lessons", {
          lessonId,
          title: "Published lesson",
          published: true,
        })
      );
      assert.equal(updated.status, 200);
      const updatedLesson = await Lesson.findById(lessonId).lean();
      assert.equal(updatedLesson?.title, "Published lesson");
      assert.equal(updatedLesson?.published, true);
      assert.equal(updatedLesson?.courseId.toString(), course._id.toString());

      const publishedPage = await academyCoursePage({
        params: Promise.resolve({ slug: course.slug }),
      });
      assert.equal(renderToStaticMarkup(publishedPage).includes("Published lesson"), true);
    });

    test("invalid slugs and malformed lesson input are rejected", async () => {
      await createUser("admin");
      const invalidCourse = await createCourse(
        makeRequest("http://localhost/api/admin/courses", {
          title: "Invalid slug",
          slug: "../bad",
          description: "Description",
          category: "Testing",
        })
      );
      assert.equal(invalidCourse.status, 400);

      const malformedLesson = await createLesson(
        makeRequest("http://localhost/api/admin/lessons", {
          courseId: "not-an-object-id",
          title: "Malformed",
        })
      );
      assert.equal(malformedLesson.status, 400);
    });

    test("admins can create challenges but flags never appear in API DTOs", async () => {
      await createUser("admin");
      const slug = nextSlug("safe-lab");
      const flag = `FLAG{${nextSlug("private").toUpperCase()}}`;
      const created = await createLab(
        makeRequest("http://localhost/api/admin/labs", {
          title: "Safe challenge",
          slug,
          description: "Public description",
          category: "Web",
          difficulty: "Beginner",
          estimatedHours: 1,
          instructions: "Follow the prompt.",
          hints: ["Read closely."],
          xpReward: 50,
          coinsReward: 5,
          flag,
          tags: ["web"],
          published: true,
        })
      );
      assert.equal(created.status, 201);
      const text = await created.text();
      const createdBody = JSON.parse(text);
      const labId = createdBody.lab._id as string;
      labs.push(new mongoose.Types.ObjectId(labId));
      assert.equal(text.includes(flag), false);
      assert.equal(text.includes("flagHash"), false);

      const publicResponse = await listLabs(new Request("http://localhost/api/labs"));
      const publicText = await publicResponse.text();
      assert.equal(publicText.includes(flag), false);
      assert.equal(publicText.includes("flagHash"), false);
      assert.ok(JSON.parse(publicText).labs.some((lab: { slug: string }) => lab.slug === slug));
    });

    test("challenge test endpoint verifies config without creating progress or rewards", async () => {
      const admin = await createUser("admin");
      const slug = nextSlug("config-test");
      const flag = `FLAG{${nextSlug("check").toUpperCase()}}`;
      const created = await createLab(
        makeRequest("http://localhost/api/admin/labs", {
          title: "Draft challenge",
          slug,
          description: "Draft only",
          category: "Web",
          flag,
          published: false,
        })
      );
      assert.equal(created.status, 201);
      const { lab } = await created.json();
      const labId = String(lab._id);
      labs.push(new mongoose.Types.ObjectId(labId));

      const response = await testLabConfig(
        makeRequest(`http://localhost/api/admin/labs/${labId}/test`, { flag }),
        { params: Promise.resolve({ id: labId }) }
      );
      const result = await response.json();
      assert.equal(result.valid, true);
      assert.match(result.message, /No rewards were granted/);
      const unchangedUser = await User.findById(admin._id).lean();
      assert.equal(unchangedUser?.xp, 0);
      assert.equal(unchangedUser?.coins, 100);
    });
  }
);
