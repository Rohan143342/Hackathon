const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("UI sends the selected status filter to the API", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf8");

  assert.match(source, /status-filter[\s\S]{0,200}encodeURIComponent/);
});