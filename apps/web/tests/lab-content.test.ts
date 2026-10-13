import assert from "node:assert/strict";
import { test } from "node:test";

import { hashFlag, isValidSlug, toPublicLab, verifyFlag } from "../lib/lab-content";

test("public lab DTO contains only learner-facing fields", () => {
  const dto = toPublicLab({
    _id: "lab-id",
    title: "Example",
    slug: "example",
    description: "Description",
    difficulty: "Beginner",
    estimatedHours: 1,
    instructions: "Read",
    hints: ["Hint"],
    category: "Web",
    xpReward: 10,
    coinsReward: 2,
    badge: "Starter",
    tags: ["web"],
    published: true,
    flag: "FLAG{private}",
    flagHash: "private-hash",
    databaseCredential: "private",
  });

  assert.equal(dto._id, "lab-id");
  assert.equal("flag" in dto, false);
  assert.equal("flagHash" in dto, false);
  assert.equal("databaseCredential" in dto, false);
});

test("challenge slug validation accepts only lower-case URL-safe slugs", () => {
  assert.equal(isValidSlug("web-basics-2"), true);
  assert.equal(isValidSlug("Web-Basics"), false);
  assert.equal(isValidSlug("web--basics"), false);
  assert.equal(isValidSlug("../private"), false);
  assert.equal(isValidSlug(""), false);
});

test("expected flag hashes verify without storing or exposing the raw flag", async () => {
  const expected = "FLAG{example}";
  const storedHash = await hashFlag(expected);

  assert.notEqual(storedHash, expected);
  assert.equal(await verifyFlag(expected, storedHash), true);
  assert.equal(await verifyFlag("FLAG{incorrect}", storedHash), false);
  assert.equal(await verifyFlag(expected, "invalid-hash"), false);
});
