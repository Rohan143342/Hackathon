const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const { startTestServer } = require("./support/server");

let app;

before(async () => { app = await startTestServer(); });
after(() => app.close());

test("invalid reminder ids return a handled client error", async () => {
  for (const id of ["999", "-1", "not-a-number"]) {
    const { response } = await app.request(`/api/insufficiencies/${id}/remind`, { method: "POST" });

    assert.ok(response.status === 400 || response.status === 404);
  }
});