import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
const svg=await readFile(new URL('../app/public/icons/calendar.svg',import.meta.url),'utf8');
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
  const page=await browser.newPage();
  for(const size of [192,512]) {
    await page.setViewportSize({width:size,height:size});
    await page.setContent(`<style>body{margin:0}svg{display:block;width:100vw;height:100vh}</style>${svg}`);
    const png=await page.screenshot();
    await writeFile(new URL(`../app/public/icons/calendar-${size}.png`,import.meta.url),png);
    if(size===512) await writeFile(new URL('../app/public/icons/calendar-maskable-512.png',import.meta.url),png);
  }
} finally {await browser.close();}
