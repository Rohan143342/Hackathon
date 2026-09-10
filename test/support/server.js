const { spawn } = require("node:child_process");

async function startTestServer() {
  const port = 3100 + Math.floor(Math.random() * 500);
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ["server.js"], {
    cwd: __dirname + "/../..",
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  await new Promise((resolve, reject) => {
    let output = "";
    server.stdout.on("data", (chunk) => {
      output += chunk;
      if (output.includes("listening on port")) resolve();
    });
    server.once("error", reject);
    setTimeout(() => reject(new Error(`Server did not start: ${output}`)), 5000);
  });

  const initial = await fetch(baseUrl + "/api/insufficiencies");
  const cookie = initial.headers.get("set-cookie").split(";")[0];

  return {
    request(path, options = {}) {
      return fetch(baseUrl + path, {
        ...options,
        headers: { ...(options.headers || {}), Cookie: cookie }
      }).then(async (response) => ({
        response,
        body: await response.json()
      }));
    },
    close() {
      server.kill();
    }
  };
}

module.exports = { startTestServer };