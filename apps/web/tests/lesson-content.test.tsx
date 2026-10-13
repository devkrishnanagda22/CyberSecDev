import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import LessonContent from "../components/academy/LessonContent";

const lessonContent = readFileSync(
  new URL("../content/academy/how-the-web-works.md", import.meta.url),
  "utf8"
);

test("lesson source includes the required beginner learning sections", () => {
  const requiredSections = [
    "Learning objectives",
    "What happens when you open a website",
    "Client-server architecture",
    "DNS and HTTPS",
    "HTTP request structure",
    "HTTP response structure and status codes",
    "Request methods",
    "Headers, query parameters, bodies, and JSON",
    "Cookies and sessions",
    "Authentication versus authorization",
    "Inspect Network requests safely",
    "Common security mistakes and defenses",
    "Worked request and response",
    "Short glossary",
    "Knowledge check",
    "Practical exercise: inspect a local read-only request",
    "Lesson summary",
  ];

  for (const section of requiredSections) {
    assert.ok(lessonContent.includes(section), `Missing lesson section: ${section}`);
  }

  assert.equal((lessonContent.match(/^### Question [1-5]$/gm) ?? []).length, 5);
  assert.match(lessonContent, /does not grade or persist quiz answers/i);
});

test("renderer emits headings and multiline code blocks as escaped text", () => {
  const markup = renderToStaticMarkup(
    createElement(LessonContent, {
      lessonTitle: "Renderer test",
      content: "## Example\n\n```http\nGET / HTTP/1.1\nHost: example.test\n```\n\n<script>alert(1)</script>",
    })
  );

  assert.match(markup, /<h3[^>]*>Example<\/h3>/);
  assert.match(markup, /<pre[^>]*><code>GET \/ HTTP\/1\.1\nHost: example\.test<\/code><\/pre>/);
  assert.match(markup, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(markup, /<script>/);
});

test("renderer groups unordered and ordered items into safe semantic lists", () => {
  const markup = renderToStaticMarkup(
    createElement(LessonContent, {
      content: "- First item\n- Second item\n\n1. Step one\n2. Step two",
    })
  );

  assert.match(markup, /<ul[^>]*><li>First item<\/li><li>Second item<\/li><\/ul>/);
  assert.match(markup, /<ol[^>]*><li>Step one<\/li><li>Step two<\/li><\/ol>/);
});