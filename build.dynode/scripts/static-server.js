const http = require("http");
const fs = require("fs");
const path = require("path");
const port = process.argv[2] ? Number(process.argv[2]) : 5000;
const root = path.join(__dirname, "..", "dist");

const server = http.createServer((req, res) => {
  let filePath = path.join(root, req.url.split("?")[0]);
  if (req.url === "/") filePath = path.join(root, "index.html");
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // fallback to index.html for SPA routes
      filePath = path.join(root, "index.html");
    }
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, () => console.log("Static server listening on", port));
