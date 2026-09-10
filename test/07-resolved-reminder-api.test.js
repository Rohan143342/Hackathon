const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const { startTestServer } = require("./support/server");

let app;

before(async () => { app = await startTestServer(); });
after(() => app.close());

test("resolved insufficiencies cannot receive reminders", async () => {
  await app.request("/api/reset", { method: "POST" });
  const { response } = await app.request("/api/insufficiencies/3/remind", { method: "POST" });

  assert.equal(response.status, 400);
});