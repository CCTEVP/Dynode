const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const url =
    process.argv[2] ||
    "http://localhost:8080/creatives/edit/67e5255aa5019234ba89509c";
  console.log("Puppeteer test URL:", url);
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  page.setViewport({ width: 1400, height: 900 });
  page.on("console", (msg) => console.log("PAGE:", msg.text()));
  // Optionally accept a token as second arg, otherwise create a temporary JWT-like token
  const suppliedToken = process.argv[3];
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
    return `${b64(header)}.${b64(payload)}.`; // trailing dot for empty signature
  }

  const tokenToUse = suppliedToken || makeFakeToken();
  console.log("Using auth token (first 32 chars):", tokenToUse.slice(0, 32));

  // Ensure token is present before any app script runs
  await page.evaluateOnNewDocument((t) => {
    try {
      localStorage.setItem("dynode_auth_token", t);
    } catch (e) {
      /* ignore */
    }
  }, tokenToUse);
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  } catch (e) {
    console.error("goto error:", e.message);
  }

  // wait for left panel or edit content
  try {
    await page.waitForSelector(".panel.left-elements .element-list", {
      timeout: 20000,
    });
  } catch (e) {
    console.error("Left-panel element-list not found");
    const html = await page.content();
    fs.writeFileSync(
      "scripts/puppeteer-check-selection-page.html",
      html,
      "utf8"
    );
    console.log(
      "Saved page HTML to scripts/puppeteer-check-selection-page.html"
    );
    await browser.close();
    process.exit(2);
  }

  // Try to find a row that contains 'countdown' text (case-insensitive)
  let target = null;
  try {
    const matches = await page.$x(
      "//div[contains(@class,'panel') and contains(@class,'left-elements')]//div[contains(@class,'layer-row') and contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'countdown')] "
    );
    if (matches && matches.length) {
      target = matches[0];
      console.log("Found countdown row via XPath");
    }
  } catch (e) {}

  if (!target) {
    try {
      target = await page.$(".panel.left-elements .element-list .layer-row");
      if (target) console.log("Falling back to first left-panel row");
    } catch (e) {}
  }

  if (!target) {
    console.error("No left-panel row to click");
    await browser.close();
    process.exit(3);
  }

  // Scroll into view and click
  try {
    await target.evaluate((el) =>
      el.scrollIntoView({ block: "center", behavior: "auto" })
    );
    await target.click();
    console.log("Clicked target row");
  } catch (e) {
    console.error("Click error:", e.message);
  }

  // wait for selection to apply (portable sleep)
  await new Promise((res) => setTimeout(res, 500));

  const result = await page.evaluate(() => {
    const sel =
      document.querySelector(".panel.left-elements .layer-row.selected") ||
      document.querySelector('.panel.left-elements [data-selected="true"]');
    const selText = sel ? sel.innerText : null;
    return {
      hasSelectedClass: !!document.querySelector(
        ".panel.left-elements .layer-row.selected"
      ),
      hasDataSelected: !!document.querySelector(
        '.panel.left-elements [data-selected="true"]'
      ),
      selectedText: selText,
      time: Date.now(),
    };
  });

  const shot = "scripts/puppeteer-selection.png";
  await page.screenshot({ path: shot, fullPage: true });
  console.log("Screenshot saved to", shot);
  console.log("Result:", JSON.stringify(result, null, 2));

  await browser.close();
})();
