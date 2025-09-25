const puppeteer = require("puppeteer");

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

  const dims = await page.evaluate(() => {
    const sel = (s) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        selector: s,
        height: r.height,
        top: r.top,
        bottom: r.bottom,
        scrollHeight: el.scrollHeight || null,
      };
    };
    return [
      sel(".editor-container"),
      sel(".editor-container"),
      sel(".creative-canvas-wrapper"),
      sel(".creative-canvas-outer"),
      sel(".creative-canvas-scroll"),
      sel(".creative-canvas-inner"),
      {
        selector: "document",
        height: document.documentElement.scrollHeight,
        bodyHeight: document.body.scrollHeight,
      },
    ];
  });

  console.log(JSON.stringify(dims, null, 2));
  await browser.close();
})();
