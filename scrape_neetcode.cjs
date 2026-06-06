const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('graphql') || url.includes('api') || url.endsWith('.json')) {
      console.log('Intercepted:', url);
      try {
        const text = await response.text();
        console.log('Response snippet:', text.substring(0, 200));
      } catch(e) {}
    }
  });

  await page.goto('https://neetcode.io/problems/dynamicArray', { waitUntil: 'networkidle0' });
  await browser.close();
})();
