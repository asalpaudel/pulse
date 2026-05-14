const puppeteer = require('/Users/asal/.npm/_npx/668c188756b835f3/node_modules/puppeteer');
const [,, htmlFile, outFile] = process.argv;
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 2 });
  await page.goto('file://' + htmlFile, { waitUntil: 'networkidle0' });
  const el = await page.$('svg') || await page.$('body');
  await el.screenshot({ path: outFile });
  await browser.close();
  console.log('done: ' + outFile);
})();
