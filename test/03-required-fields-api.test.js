const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const { startTestServer } = require("./support/server");

let app;

before(async () => { app = await startTestServer(); });
after(() => app.close());

test("create rejects missing and blank required fields", async () => {
  for (const payload of [{}, { candidateName: " ", reason: "Valid reason" }, { candidateName: "Valid name", reason: " " }]) {
    const { response } = await app.request("/api/insufficiencies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    assert.equal(response.status, 400);
  }
});