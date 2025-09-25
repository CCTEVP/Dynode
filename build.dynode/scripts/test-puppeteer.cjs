const puppeteer = require("puppeteer");

(async () => {
  try {
    console.log("Launching puppeteer...");
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
    console.log(
      "Page loaded, taking screenshot to scripts/puppeteer-screenshot.png"
    );
    await page.screenshot({
      path: "scripts/puppeteer-screenshot.png",
      fullPage: true,
    });
    await browser.close();
    console.log("Done.");
  } catch (err) {
    console.error("Error running puppeteer test:", err && err.message);
    process.exit(2);
  }
})();
