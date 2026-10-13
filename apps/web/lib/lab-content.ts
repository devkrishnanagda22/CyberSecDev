import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(nodeScrypt);
const FLAG_HASH_BYTES = 64;

export interface PublicLab {
  _id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  estimatedHours: number;
  instructions: string;
  hints: string[];
  category: string;
  xpReward: number;
  coinsReward: number;
  badge: string;
  tags: string[];
  published: boolean;
}

export function toPublicLab(lab: Record<string, unknown>): PublicLab {
  return {
    _id: String(lab._id),
    title: String(lab.title ?? ""),
    slug: String(lab.slug ?? ""),
    description: String(lab.description ?? ""),
    difficulty: String(lab.difficulty ?? "Beginner"),
    estimatedHours: Number(lab.estimatedHours ?? 1),
    instructions: String(lab.instructions ?? ""),
    hints: Array.isArray(lab.hints) ? lab.hints.map(String) : [],
    category: String(lab.category ?? "General"),
    xpReward: Number(lab.xpReward ?? 0),
    coinsReward: Number(lab.coinsReward ?? 0),
    badge: String(lab.badge ?? ""),
    tags: Array.isArray(lab.tags) ? lab.tags.map(String) : [],
    published: Boolean(lab.published),
  };
}

export async function hashFlag(flag: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(flag, salt, FLAG_HASH_BYTES)) as Buffer;
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyFlag(
  submittedFlag: string,
  storedHash: string
): Promise<boolean> {
  const [saltHex, hashHex, extra] = storedHash.split(":");

  if (
    extra !== undefined ||
    !/^[a-f0-9]{32}$/i.test(saltHex ?? "") ||
    !/^[a-f0-9]{128}$/i.test(hashHex ?? "")
  ) {
    return false;
  }

  const expected = Buffer.from(hashHex, "hex");
  const actual = (await scrypt(
    submittedFlag,
    Buffer.from(saltHex, "hex"),
    FLAG_HASH_BYTES
  )) as Buffer;

  return timingSafeEqual(actual, expected);
}

export function verifyLegacyFlag(submittedFlag: string, expectedFlag: string): boolean {
  const submitted = Buffer.from(submittedFlag);
  const expected = Buffer.from(expectedFlag);
  return submitted.length === expected.length && timingSafeEqual(submitted, expected);
}

export function isValidSlug(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 80 &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
  );
}
