const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const { startTestServer } = require("./support/server");

let app;

before(async () => { app = await startTestServer(); });
after(() => app.close());

test("new insufficiencies start with zero reminders", async () => {
  const { response, body } = await app.request("/api/insufficiencies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidateName: "New Candidate", reason: "Missing document" })
  });

  assert.equal(response.status, 201);
  assert.equal(body.reminderCount, 0);
});