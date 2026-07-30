const puppeteer = require('puppeteer');
const fs = require('fs');

const missing = [
  "Canopy Park Jewel",
  "SuperTree Observatory",
  "Dolphin Island Sentosa",
  "Harry Potter Visions of Magic Singapore"
];

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const results = {};
  for (const name of missing) {
    try {
      console.log(`Searching Klook for: ${name}`);
      await page.goto(`https://www.klook.com/en-US/search/result/?query=${encodeURIComponent(name)}`, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const imgUrl = await page.evaluate(() => {
        // Find the first product image
        const img = document.querySelector('img[src*="res.klook.com/image/upload"]');
        return img ? img.src : null;
      });
      
      if (imgUrl) {
        console.log(`Found: ${imgUrl}`);
        results[name] = imgUrl;
      } else {
        console.log(`Not found for ${name}`);
      }
    } catch (e) {
      console.error(`Error for ${name}: ${e.message}`);
    }
  }
  
  fs.writeFileSync('klook_images.json', JSON.stringify(results, null, 2));
  await browser.close();
}

run();
