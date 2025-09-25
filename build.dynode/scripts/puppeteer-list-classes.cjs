const puppeteer = require("puppeteer");
(async () => {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node puppeteer-list-classes.cjs <url>");
    process.exit(2);
  }
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem("dynode_auth_token", JSON.stringify({ fake: true }));
    } catch (e) {}
  });
  page.on("console", (msg) => console.log("PAGE:", msg.text()));
  await page
    .goto(url, { waitUntil: "networkidle2", timeout: 60000 })
    .catch((e) => console.error("goto", e));
  await new Promise((r) => setTimeout(r, 500));
  const classes = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll("*"));
    const cls = new Set();
    all.forEach((n) => {
      if (n.className && typeof n.className === "string") {
        n.className
          .split(/\s+/)
          .filter(Boolean)
          .forEach((c) => cls.add(c));
      }
    });
    return Array.from(cls).slice(0, 500);
  });
  console.log("Classes found:", classes.join(", "));
  const candidates = await page.evaluate(() => {
    const arr = Array.from(document.querySelectorAll("*"));
    return arr
      .filter(
        (n) =>
          n.className &&
          typeof n.className === "string" &&
          /layer|element|panel|list|left/i.test(n.className)
      )
      .slice(0, 50)
      .map((n) => ({
        tag: n.tagName,
        class: n.className,
        id: n.id,
        html: n.outerHTML.slice(0, 500),
      }));
  });
  console.log("Candidates:", JSON.stringify(candidates, null, 2));
  await browser.close();
})();
