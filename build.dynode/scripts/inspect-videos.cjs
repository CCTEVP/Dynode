const puppeteer = require("puppeteer");
const http = require("http");
const https = require("https");

function headRequest(url, timeout = 5000) {
  return new Promise((resolve) => {
    try {
      const lib = url.startsWith("https") ? https : http;
      const req = lib.request(url, { method: "HEAD" }, (res) => {
        resolve({ status: res.statusCode, headers: res.headers });
      });
      req.on("error", (e) => resolve({ error: e.message }));
      req.setTimeout(timeout, () => {
        req.destroy();
        resolve({ error: "timeout" });
      });
      req.end();
    } catch (e) {
      resolve({ error: String(e) });
    }
  });
}

(async () => {
  const url =
    process.argv[2] ||
    "http://localhost:4000/creatives/edit/67e5255aa5019234ba89509c";
  console.log("Inspecting URL:", url);
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  page.on("console", (m) => console.log("PAGE:", m.text()));
  // set fake token
  await page.evaluateOnNewDocument((t) => {
    try {
      localStorage.setItem("dynode_auth_token", t);
    } catch (e) {}
  }, "ey.fake.token");
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  } catch (e) {
    console.error("goto:", e.message);
  }
  await new Promise((r) => setTimeout(r, 800));

  // Click second scene (index 1) if exists
  const hasScene = await page.$$(".scene-selector .scene-row, .scene-row");
  if (hasScene && hasScene.length > 1) {
    await page.evaluate(() => {
      const nodes = Array.from(
        document.querySelectorAll(".scene-selector .scene-row, .scene-row")
      );
      const el = nodes[1];
      if (el) el.click();
    });
    console.log("Clicked scene index 1");
    await new Promise((r) => setTimeout(r, 500));
  } else {
    console.log("No scene rows or less than 2 found");
  }

  // Find visible scene section
  const sceneInfo = await page.evaluate(() => {
    const sections = Array.from(
      document.querySelectorAll("section[data-scene-index]")
    );
    return sections.map((s) => ({
      index: s.getAttribute("data-scene-index"),
      ariaHidden: s.getAttribute("aria-hidden"),
      display: window.getComputedStyle(s).display,
      html: s.innerHTML ? s.innerHTML.slice(0, 200) : "",
    }));
  });
  console.log("Scene sections:", sceneInfo);

  // Inspect video sources inside visible sections
  const videoSources = await page.evaluate(() => {
    const sections = Array.from(
      document.querySelectorAll("section[data-scene-index]")
    );
    const visible = sections.filter(
      (s) =>
        s.getAttribute("aria-hidden") === "false" ||
        window.getComputedStyle(s).display !== "none"
    );
    const vids = [];
    visible.forEach((s) => {
      const vs = Array.from(s.querySelectorAll("video source"));
      vs.forEach((v) =>
        vids.push({ src: v.getAttribute("src"), type: v.getAttribute("type") })
      );
      const direct = Array.from(s.querySelectorAll("video"));
      direct.forEach((v) => {
        if (v.currentSrc)
          vids.push({
            src: v.currentSrc,
            type: v.getAttribute("data-mime-type") || null,
          });
      });
    });
    return vids;
  });

  console.log("Found video sources:", videoSources);

  for (const vs of videoSources) {
    if (!vs.src) {
      console.log("No src for video entry", vs);
      continue;
    }
    const res = await headRequest(vs.src).catch((e) => ({ error: String(e) }));
    console.log("HEAD", vs.src, "->", res);
  }

  await browser.close();
})();
