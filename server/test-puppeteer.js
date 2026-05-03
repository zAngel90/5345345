import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Go to the inventory API directly
  await page.goto('https://www.roblox.com/users/inventory/list-json?assetTypeId=34&cursor=&itemsPerPage=100&pageNumber=1&userId=9314463293', { waitUntil: 'networkidle2' });
  
  const content = await page.evaluate(() => document.body.innerText);
  console.log('INVENTORY API RESULT:', content);
  
  await browser.close();
})();
