const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("UI maps OPEN and RESOLVED statuses to the correct badge classes", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf8");

  assert.match(source, /const badgeClass = isResolved \? "badge-resolved" : "badge-open"/);
});