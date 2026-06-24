const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PLACE_URL =
  'https://www.google.com/maps/place/iPro+Technologies+Used+Laptops+Store/@12.915473,77.6484697,17z/data=!4m6!3m5!1s0x3bae1501facb8911:0x19e2b64ac18e7889!8m2!3d12.915473!4d77.6484697!16s%2Fg%2F11tsqt9mws!5m1!1e1';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: CHROME,
    args: ['--no-sandbox', '--window-size=1400,900'],
  });
  const page = await browser.newPage();
  await page.goto(PLACE_URL, { waitUntil: 'networkidle2', timeout: 120000 });
  await new Promise(r => setTimeout(r, 10000));

  await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('button[role="tab"]')];
    const reviewsTab = tabs.find(t => /reviews/i.test(t.textContent || ''));
    reviewsTab?.click();
  });
  await new Promise(r => setTimeout(r, 8000));

  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => {
      document.querySelectorAll('div').forEach(el => {
        if (el.scrollHeight > el.clientHeight + 100) el.scrollTop += 500;
      });
    });
    await new Promise(r => setTimeout(r, 1000));
  }

  const data = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('div.jftiEf')];
    return {
      limitedView: document.body.innerText.includes('limited view'),
      tabLabels: [...document.querySelectorAll('button[role="tab"]')].map(t => t.textContent?.trim()),
      cardCount: cards.length,
      reviews: cards.map(card => ({
        name: card.querySelector('.d4r55')?.textContent?.trim(),
        text: card.querySelector('.wiI7pd')?.textContent?.trim(),
        date: card.querySelector('.rsqaWe')?.textContent?.trim(),
      })).filter(r => r.text),
    };
  });

  console.log(JSON.stringify(data, null, 2));
  fs.writeFileSync(path.join(__dirname, '..', 'backend', 'data', 'google-reviews.json'), JSON.stringify(data, null, 2));
  await browser.close();
})();
