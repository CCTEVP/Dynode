const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    const url =
      process.argv[2] ||
      "http://localhost:4000/creatives/edit/67e5255aa5019234ba89509c";
    console.log("Opening", url);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Wait for the editor content to appear
    try {
      await page.waitForSelector(".editor-container", { timeout: 15000 });
    } catch (e) {
      console.error(
        "editor-container not found; dumping page html to scripts/force-select.html"
      );
      const html = await page.content();
      fs.writeFileSync("scripts/force-select.html", html, "utf8");
      await browser.close();
      process.exit(2);
    }

    // Dispatch a selection event for the countdown parent: scene 0, child 1
    console.log("Dispatching creative:select event (indexPath [0,1])");
    await page.evaluate(() => {
      const ev = new CustomEvent("creative:select", {
        detail: { indexPath: [0, 1] },
      });
      window.dispatchEvent(ev);
    });

    await page.waitForTimeout(500);

    // capture screenshot
    const shotPath = "scripts/force-select-screenshot.png";
    await page.screenshot({ path: shotPath, fullPage: true });
    console.log("Saved screenshot to", shotPath);

    // check left-panel selection state
    const result = await page.evaluate(() => {
      const sel =
        document.querySelector(".panel.left-elements .layer-row.selected") ||
        document.querySelector('.panel.left-elements [data-selected="true"]');
      return {
        hasSelectedClass: !!document.querySelector(
          ".panel.left-elements .layer-row.selected"
        ),
        hasDataSelected: !!document.querySelector(
          '.panel.left-elements [data-selected="true"]'
        ),
        selectedHtml: sel ? sel.outerHTML : null,
      };
    });

    console.log(JSON.stringify(result, null, 2));
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err && err.message);
    process.exit(3);
  }
})();
