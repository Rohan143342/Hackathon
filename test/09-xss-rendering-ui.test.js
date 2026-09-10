const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("UI does not interpolate user content into HTML", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf8");

  assert.doesNotMatch(source, /<td>\$\{item\.candidateName\}<\/td>/);
  assert.doesNotMatch(source, /<td>\$\{item\.reason\}<\/td>/);
  assert.match(source, /textContent/);
});