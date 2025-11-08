import http from "http";
import { spawn } from "child_process";
import { URL } from "url";

const PORT = process.env.PORT || 5174;

const sendJson = (res, status, obj) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(obj));
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") {
    // CORS preflight
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  if (url.pathname === "/api/generate-post" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");

        // Spawn python script and pass payload via stdin
        const py = spawn("python", ["server/genaratePost.py"]);

        let stdout = "";
        let stderr = "";

        py.stdout.on("data", (d) => (stdout += d.toString()));
        py.stderr.on("data", (d) => (stderr += d.toString()));

        py.on("close", (code) => {
          if (code !== 0) {
            console.error("Python script error", stderr);
            return sendJson(res, 500, {
              error: "Python script failed",
              details: stderr,
            });
          }
          // Return generated text
          return sendJson(res, 200, { post: stdout });
        });

        // Write payload to python stdin
        py.stdin.write(JSON.stringify(payload));
        py.stdin.end();
      } catch (err) {
        console.error("Generate post parse error", err);
        sendJson(res, 400, { error: "Invalid request" });
      }
    });
    return;
  }

  // Not found
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Generate-post server listening on http://localhost:${PORT}`);
});
