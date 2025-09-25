const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  const url =
    process.argv[2] ||
    "http://localhost:4000/creatives/edit/67e5255aa5019234ba89509c";
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((res) => setTimeout(res, 2000));
  const html = await page.content();
  fs.writeFileSync("scripts/edit-page.html", html, "utf8");
  console.log("Wrote scripts/edit-page.html");
  await browser.close();
})();
