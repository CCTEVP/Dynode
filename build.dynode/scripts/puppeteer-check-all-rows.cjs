const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node puppeteer-check-all-rows.cjs <url>");
    process.exit(2);
  }
  const suppliedToken = process.argv[3] || null;

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

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  page.setViewport({ width: 1400, height: 900 });
  page.on("console", (m) => console.log("PAGE:", m.text()));

  const tokenToUse = suppliedToken || makeFakeToken();
  await page.evaluateOnNewDocument((t) => {
    try {
      localStorage.setItem("dynode_auth_token", t);
    } catch (e) {}
  }, tokenToUse);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  } catch (e) {
    console.error("goto error", e);
  }

  await sleep(600);

  const rows = await page
    .$$eval(
      ".panel.left-elements .layer-row, .panel.left-elements .element-list .layer-row, .layer-row, .element-list .layer-row",
      (nodes) =>
        nodes.map((n) => ({
          text:
            n.querySelector && n.querySelector(".layer-label")
              ? n.querySelector(".layer-label").textContent.trim()
              : (n.textContent || "").trim(),
          id: n.id || null,
        }))
    )
    .catch(() => []);

  if (!rows || rows.length === 0) {
    console.error("No rows found - aborting");
    const html = await page.content();
    fs.writeFileSync(
      "scripts/puppeteer-check-all-rows-page.html",
      html,
      "utf8"
    );
    console.log(
      "Saved page to scripts/puppeteer-check-all-rows-page.html for inspection"
    );
    await browser.close();
    process.exit(3);
  }

  const results = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    try {
      if (r.id) {
        await page.evaluate((id) => {
          const el = document.getElementById(id);
          if (el) el.click();
        }, r.id);
      } else {
        await page.evaluate((idx) => {
          const nodes = document.querySelectorAll(
            ".panel.left-elements .layer-row, .layer-row, .element-list .layer-row"
          );
          const el = nodes[idx];
          if (el) el.click();
        }, i);
      }
    } catch (e) {
      // ignore click errors
    }

    await sleep(300);

    const info = await page
      .evaluate((idx) => {
        const nodes = document.querySelectorAll(
          ".panel.left-elements .layer-row, .layer-row, .element-list .layer-row"
        );
        const el = nodes[idx];
        if (!el) return { idx, found: false };
        const selectedClass = !!el.classList.contains("selected");
        const dataSel =
          el.getAttribute && el.getAttribute("data-selected") === "true";
        return {
          idx,
          found: true,
          id: el.id || null,
          dataItemId: el.getAttribute ? el.getAttribute("data-item-id") : null,
          text:
            el.querySelector && el.querySelector(".layer-label")
              ? el.querySelector(".layer-label").textContent.trim()
              : (el.textContent || "").trim(),
          selectedClass,
          dataSelected: dataSel,
        };
      }, i)
      .catch(() => ({ idx: i, found: false }));

    const canvasInfo = await page
      .evaluate(() => {
        const nodes = Array.from(
          document.querySelectorAll('[data-selected="true"]')
        );
        return nodes.map((n) => ({
          id: n.id || null,
          tag: n.tagName,
          path: n.getAttribute("data-index-path") || null,
        }));
      })
      .catch(() => []);

    results.push({ row: r, info, canvasSelected: canvasInfo });
  }

  const out = { url, time: Date.now(), results };
  fs.writeFileSync(
    "scripts/puppeteer-check-all-rows.json",
    JSON.stringify(out, null, 2)
  );
  await page
    .screenshot({
      path: "scripts/puppeteer-check-all-rows.png",
      fullPage: true,
    })
    .catch(() => {});
  console.log("Done. Wrote JSON and screenshot.");

  await browser.close();
})();
