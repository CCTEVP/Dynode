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

  // wait for element list to render
  try {
    await page.waitForSelector(
      ".panel.left-elements .element-list .layer-row",
      { timeout: 20000 }
    );
  } catch (e) {
    console.error(
      "Left panel items did not render; saving page content to scripts/check-left-selection.html"
    );
    const html = await page.content();
    const fs = require("fs");
    fs.writeFileSync("scripts/check-left-selection.html", html, "utf8");
    await browser.close();
    process.exit(2);
  }

  // find the countdown row by text if present, else pick first row
  const rowHandle = await page.$x(
    "//div[contains(@class,'panel') and contains(@class,'left-elements')]//div[contains(@class,'layer-row') and contains(., 'countdown')]"
  );
  let target = null;
  if (rowHandle && rowHandle.length) target = rowHandle[0];
  else target = await page.$(".panel.left-elements .element-list .layer-row");

  if (!target) {
    console.error("No left panel row found");
    await browser.close();
    process.exit(2);
  }

  // click the row
  await target.click();
  await page.waitForTimeout(300);

  // evaluate selection state
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
})();
