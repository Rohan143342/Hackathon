const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const port = 3100 + Math.floor(Math.random() * 500);
const baseUrl = `http://127.0.0.1:${port}`;
let server;
let cookie;

function request(path, options = {}) {
  return fetch(baseUrl + path, {
    ...options,
    headers: { ...(options.headers || {}), ...(cookie ? { Cookie: cookie } : {}) }
  }).then(async (response) => ({
    response,
    body: await response.json()
  }));
}

before(async () => {
  server = spawn(process.execPath, ["server.js"], {
    cwd: __dirname + "/..",
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"]
  });
  await new Promise((resolve, reject) => {
    let output = "";
    const onData = (chunk) => {
      output += chunk;
      if (output.includes("listening on port")) resolve();
    };
    server.stdout.on("data", onData);
    server.once("error", reject);
    setTimeout(() => reject(new Error(`Server did not start: ${output}`)), 5000);
  });
  const initial = await fetch(baseUrl + "/api/insufficiencies");
  cookie = initial.headers.get("set-cookie").split(";")[0];
});

after(() => server.kill());

test("status filter accepts documented uppercase values", async () => {
  const { response, body } = await request("/api/insufficiencies?status=OPEN");

  assert.equal(response.status, 200);
  assert.ok(body.length > 0);
  assert.ok(body.every((item) => item.status === "OPEN"));
});

test("UI sends the selected status filter to the API", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf8");

  assert.match(source, /status-filter[\s\S]{0,200}encodeURIComponent/);
});

test("create rejects missing and blank required fields", async () => {
  for (const payload of [{}, { candidateName: " ", reason: "Valid reason" }, { candidateName: "Valid name", reason: " " }]) {
    const { response } = await request("/api/insufficiencies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    assert.equal(response.status, 400);
  }
});

test("new insufficiencies start with zero reminders", async () => {
  const { response, body } = await request("/api/insufficiencies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidateName: "New Candidate", reason: "Missing document" })
  });

  assert.equal(response.status, 201);
  assert.equal(body.reminderCount, 0);
});