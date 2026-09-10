const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const { startTestServer } = require("./support/server");

let app;

before(async () => { app = await startTestServer(); });
after(() => app.close());

test("status filter accepts documented uppercase values", async () => {
  const { response, body } = await app.request("/api/insufficiencies?status=OPEN");

  assert.equal(response.status, 200);
  assert.ok(body.length > 0);
  assert.ok(body.every((item) => item.status === "OPEN"));
});