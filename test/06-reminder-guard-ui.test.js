const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("UI disables reminders at the cap and for resolved records", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf8");

  assert.match(source, /atCap\s*\|\|\s*isResolved/);
  assert.match(source, /data-action="remind"[^>]*disabled/);
});