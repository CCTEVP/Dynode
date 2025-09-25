const puppeteer = require("puppeteer");
const fs = require("fs");
(async () => {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node puppeteer-dump-page.cjs <url>");
    process.exit(2);
  }
  const b = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const p = await b.newPage();
  await p.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem("dynode_auth_token", JSON.stringify({ fake: true }));
    } catch (e) {}
  });
  await p
    .goto(url, { waitUntil: "networkidle2", timeout: 60000 })
    .catch((e) => console.error("goto", e));
  const html = await p.content();
  fs.writeFileSync("scripts/puppeteer-dump-page.html", html);
  console.log("Saved page to scripts/puppeteer-dump-page.html");
  await b.close();
})();
