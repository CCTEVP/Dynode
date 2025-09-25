const puppeteer = require("puppeteer");

(async () => {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node puppeteer-inspect-leftpanel.cjs <url>");
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
  await page
    .goto(url, { waitUntil: "networkidle2", timeout: 60000 })
    .catch((e) => console.error("goto", e));
  const selectors = [
    ".panel.left-elements .layer-row",
    ".panel.left-elements .element-list .layer-row",
    ".panel.left-elements .element-list",
    ".panel.left-elements",
    ".panel.left",
    ".layer-row",
    ".element-list",
  ];
  for (const s of selectors) {
    const count = await page.$$eval(s, (nodes) => nodes.length).catch(() => 0);
    console.log(`${s} -> ${count}`);
    if (count > 0) {
      const sample = await page.$$eval(s, (nodes) =>
        nodes.slice(0, 1).map((n) => n.outerHTML)
      );
      console.log("Sample HTML:", sample[0].slice(0, 400));
    }
  }
  await browser.close();
})();
