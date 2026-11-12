import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
const browser = await chromium.launch({channel:'chrome'});
try {
  const page = await browser.newPage();
  await page.goto(new URL('./preview.html', import.meta.url).href);
  for (const width of [390,768,1440]) {
    await page.setViewportSize({width,height:1000});
    if (await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth)) throw new Error(`Overflow at ${width}`);
    await page.screenshot({path:fileURLToPath(new URL(`calendar-v1-${width}.png`,import.meta.url)),fullPage:true});
  }
} finally { await browser.close(); }
