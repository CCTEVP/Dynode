const puppeteer = require("puppeteer");
const fs = require("fs");
(async () => {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node puppeteer-click-second-child.cjs <url>");
    process.exit(2);
  }
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  page.on("console", (msg) => console.log("PAGE:", msg.text()));
  function makeFakeToken() {
    const header = { alg: "none", typ: "JWT" };
    const payload = {
      sub: "puppeteer",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    const b64 = (o) =>
      Buffer.from(JSON.stringify(o))
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
    return `${b64(header)}.${b64(payload)}.`;
  }
  await page.evaluateOnNewDocument((t) => {
    try {
      localStorage.setItem("dynode_auth_token", t);
    } catch (e) {}
  }, makeFakeToken());
  await page
    .goto(url, { waitUntil: "networkidle2", timeout: 60000 })
    .catch((e) => console.error("goto", e));
  await new Promise((r) => setTimeout(r, 600));
  // find rows
  const found = await page
    .$$eval(
      '.layer-row, .panel.left-elements .layer-row, .element-list .layer-row, [id^="item-"]',
      (nodes) =>
        nodes.map((n) => ({
          id: n.id || null,
          text:
            n.querySelector && n.querySelector(".layer-label")
              ? n.querySelector(".layer-label").textContent.trim()
              : (n.textContent || "").trim(),
        }))
    )
    .catch(() => []);
  if (!found || found.length < 2) {
    console.error("Not enough rows found", found.length);
    const html = await page.content();
    fs.writeFileSync(
      "scripts/puppeteer-click-second-child-page.html",
      html,
      "utf8"
    );
    await browser.close();
    process.exit(3);
  }
  // click second
  const second = found[1];
  console.log("Clicking second row:", second);
  if (second.id) {
    await page
      .evaluate((id) => {
        const el = document.getElementById(id);
        if (el) el.click();
      }, second.id)
      .catch(() => {});
  } else {
    await page
      .evaluate(() => {
        const nodes = document.querySelectorAll(
          '.layer-row, .panel.left-elements .layer-row, .element-list .layer-row, [id^="item-"]'
        );
        const el = nodes[1];
        if (el) el.click();
      })
      .catch(() => {});
  }
  await new Promise((r) => setTimeout(r, 400));
  const info = await page.evaluate(() => {
    const el = document.querySelectorAll(
      '.layer-row, .panel.left-elements .layer-row, .element-list .layer-row, [id^="item-"]'
    )[1];
    if (!el) return { found: false };
    return {
      found: true,
      id: el.id || null,
      dataItemId: el.getAttribute ? el.getAttribute("data-item-id") : null,
      selectedClass: el.classList.contains("selected"),
      dataSelected: el.getAttribute("data-selected") === "true",
      text:
        el.querySelector && el.querySelector(".layer-label")
          ? el.querySelector(".layer-label").textContent.trim()
          : (el.textContent || "").trim(),
    };
  });
  const canvasSelected = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-selected="true"]')).map(
      (n) => ({
        id: n.id || null,
        tag: n.tagName,
        path: n.getAttribute("data-index-path") || null,
      })
    )
  );
  await page
    .screenshot({
      path: "scripts/puppeteer-click-second-child.png",
      fullPage: true,
    })
    .catch(() => {});
  const out = {
    url,
    time: Date.now(),
    foundLength: found.length,
    target: second,
    info,
    canvasSelected,
  };
  fs.writeFileSync(
    "scripts/puppeteer-click-second-child.json",
    JSON.stringify(out, null, 2)
  );
  console.log("Wrote results to scripts/puppeteer-click-second-child.json");
  await browser.close();
})();
