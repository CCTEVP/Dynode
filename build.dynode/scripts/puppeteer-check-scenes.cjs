const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node puppeteer-check-scenes.cjs <url>");
    process.exit(2);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  page.setViewport({ width: 1400, height: 900 });
  page.on("console", (m) => console.log("PAGE:", m.text()));

  // put a fake token so the app thinks we're authenticated
  function makeFakeToken() {
    const header = { alg: "none", typ: "JWT" };
    const payload = {
      sub: "puppeteer",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const b64 = (obj) =>
      Buffer.from(JSON.stringify(obj))
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
    return `${b64(header)}.${b64(payload)}.`;
  }
  const token = makeFakeToken();
  await page.evaluateOnNewDocument((t) => {
    try {
      localStorage.setItem("dynode_auth_token", t);
    } catch (e) {}
  }, token);

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  } catch (e) {
    console.error("goto error", e.message || e);
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  await sleep(600);

  // collect scene rows
  const rows = await page
    .$$eval(".scene-selector .scene-row, .scene-row", (nodes) =>
      nodes.map((n, i) => ({
        idx: i,
        text: n.querySelector(".scene-label")
          ? n.querySelector(".scene-label").textContent.trim()
          : (n.textContent || "").trim(),
        hasId: !!n.id,
      }))
    )
    .catch(() => []);

  if (!rows || rows.length === 0) {
    console.error("No scene rows found - aborting");
    const html = await page.content();
    fs.writeFileSync("scripts/puppeteer-check-scenes-page.html", html, "utf8");
    await browser.close();
    process.exit(3);
  }

  const results = [];
  for (let i = 0; i < rows.length; i++) {
    // click the scene row
    await page
      .evaluate((idx) => {
        const nodes = Array.from(
          document.querySelectorAll(".scene-selector .scene-row, .scene-row")
        );
        const el = nodes[idx];
        if (el) el.click();
      }, i)
      .catch(() => {});

    await sleep(300);

    // capture which scene sections are visible
    const scenes = await page
      .$$eval("section[data-scene-index]", (nodes) =>
        nodes.map((n) => ({
          index: n.getAttribute("data-scene-index"),
          visible:
            n.getAttribute("aria-hidden") === "false" ||
            window.getComputedStyle(n).display !== "none",
        }))
      )
      .catch(() => []);

    // ensure only the clicked index is visible
    const visibleList = scenes.filter((s) => s.visible).map((s) => s.index);

    results.push({ clickedIndex: i, scenes, visibleList });
  }

  const out = { url, time: Date.now(), results };
  fs.writeFileSync(
    "scripts/puppeteer-check-scenes.json",
    JSON.stringify(out, null, 2)
  );
  await page
    .screenshot({ path: "scripts/puppeteer-check-scenes.png", fullPage: true })
    .catch(() => {});
  console.log("Done. Wrote JSON and screenshot.");

  await browser.close();
})();
