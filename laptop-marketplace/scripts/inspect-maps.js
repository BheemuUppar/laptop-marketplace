const puppeteer = require('puppeteer');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PLACE_URL =
  'https://www.google.com/maps/place/iPro+Technologies+Used+Laptops+Store/@12.915473,77.6484697,17z/data=!4m6!3m5!1s0x3bae1501facb8911:0x19e2b64ac18e7889!8m2!3d12.915473!4d77.6484697!16s%2Fg%2F11tsqt9mws!5m1!1e1';

(async () => {
  const browser = await puppeteer.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto(PLACE_URL, { waitUntil: 'networkidle2', timeout: 90000 });
  await new Promise(r => setTimeout(r, 8000));

  const info = await page.evaluate(() => {
    const starLabels = [...document.querySelectorAll('span[role="img"]')].map(el => el.getAttribute('aria-label')).filter(Boolean);
    const buttons = [...document.querySelectorAll('button')].map(b => b.textContent?.trim()).filter(t => t && t.length < 40);
    const texts = [...document.querySelectorAll('span, div')].map(el => el.textContent?.trim()).filter(t => t && t.length > 40 && t.length < 300);
    return { starLabels: starLabels.slice(0, 20), buttons: buttons.slice(0, 30), longTexts: texts.slice(0, 30) };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
