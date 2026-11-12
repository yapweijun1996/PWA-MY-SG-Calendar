import { createServer } from 'node:http';
import { readFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { resolve, join, sep, extname } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { chromium, expect } from '@playwright/test';

const root=resolve('.site-preview');
await mkdir(root,{recursive:true});
const temporary=await mkdtemp(join(root,'pwa-'));
const output=resolve('test-results/pwa');
await mkdir(output,{recursive:true});
const runId=Date.now().toString();
const builds=[`test-${runId}-N`,`test-${runId}-N1`];
let directory=join(temporary,'N');
let failWorker=false;
let server;
let browser;
const passed=[];
try {
  for(const [index,name] of ['N','N1'].entries()){
    const result=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build','--config','vite.app.config.ts','--outDir',join(temporary,name)],{env:{...process.env,CALENDAR_BUILD_ID:builds[index]},encoding:'utf8'});
    if(result.status!==0)throw new Error(result.stdout+result.stderr);
    if(result.stdout.includes("doesn't match any files"))throw new Error('Incomplete precache');
    console.log(`Built ${builds[index]}`);
  }
  server=createServer(async(req,res)=>{
    try {
      const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if(!pathname.startsWith('/calendar/')){res.writeHead(404);res.end();return;}
      if(failWorker&&pathname==='/calendar/sw.js'){res.writeHead(503);res.end();return;}
      const relative=pathname.slice('/calendar/'.length)||'index.html';
      const file=resolve(directory,relative);
      if(!file.startsWith(directory+sep)){res.writeHead(403);res.end();return;}
      const bytes=await readFile(file);
      const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};
      res.writeHead(200,{'Content-Type':mime[extname(file)]??'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);
    } catch {res.writeHead(404);res.end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  browser=await chromium.launch({channel:'chrome',headless:true});
  const context=await browser.newContext();
  const page=await context.newPage();
  await page.goto(origin+'/calendar/');
  await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByLabel('Go to date').fill('2026-02-17');
  await page.getByLabel('Week starts on').selectOption('0');
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await page.evaluate(async()=>{const cache=await caches.open('another-app-v1');await cache.put('/unrelated',new Response('preserve me'));});
  await context.setOffline(true);await page.reload();
  await expect(page.locator('.lunar-detail')).toHaveText('Month 1 · Day 1');
  await expect(page.locator('[data-event-id="sg-chinese-new-year-2026-02-17"]')).toBeVisible();
  await expect(page.getByText('Offline',{exact:true})).toBeVisible();
  await page.screenshot({path:join(output,'offline-subpath.png'),fullPage:true});
  passed.push('Warm offline relaunch at /calendar/, persisted date/week, Chinese and holiday packs');
  await page.getByRole('combobox',{name:'Region',exact:true}).selectOption('MY-02');
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByLabel('Go to date').fill('2026-07-05');
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await page.reload();
  await expect(page.locator('.region-label select')).toHaveValue('MY-02');
  await expect(page.locator('[data-event-id="my-kedah-sultan-birthday-2026-07-05"]')).toBeVisible();
  await expect(page.getByText('Annual holidays and selected amendments are included.',{exact:false})).toBeVisible();
  await page.screenshot({path:join(output,'offline-kedah-amendment.png'),fullPage:true});
  passed.push('Offline MY amendment, incomplete coverage and region/date persistence');
  await page.getByRole('combobox',{name:'Region',exact:true}).selectOption('SG');
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByLabel('Go to date').fill('2026-02-17');
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await context.setOffline(false);
  const other=await context.newPage();await other.goto(origin+'/calendar/');
  await expect(other.getByText('Saved on this device',{exact:true})).toBeVisible();
  directory=join(temporary,'N1');
  await page.getByRole('button',{name:'Check app update',exact:true}).click();
  await expect(page.getByText('A new app version is available.',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Later',exact:true}).click();
  assert.equal(await page.locator('[data-build]').getAttribute('data-build'),builds[0]);
  assert.equal(await page.evaluate(async()=>Boolean((await navigator.serviceWorker.getRegistration())?.waiting)),true);
  passed.push('Actual N+1 waits; defer keeps N and waiting worker');
  await page.getByRole('button',{name:'Update now',exact:true}).click();
  await expect(page.locator('[data-build]')).toHaveAttribute('data-build',builds[1]);
  await expect(page.locator('[aria-selected="true"] button')).toHaveAttribute('data-date','2026-02-17');
  await expect(other.locator('[data-build]')).toHaveAttribute('data-build',builds[0]);
  await expect(other.getByText('A new app version is available.',{exact:true})).toBeVisible();
  await other.getByRole('button',{name:'Update now',exact:true}).first().click();
  await expect(other.locator('[data-build]')).toHaveAttribute('data-build',builds[1]);
  assert.equal(await page.evaluate(async()=>await (await caches.open('another-app-v1')).match('/unrelated').then(r=>r?.text())),'preserve me');
  passed.push('Explicit activation, per-tab reload control, preferences and foreign cache preserved');
  failWorker=true;
  await page.getByRole('button',{name:'Check app update',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('Update could not complete');
  await expect(page.locator('.lunar-detail')).toHaveText('Month 1 · Day 1');
  failWorker=false;
  await page.getByRole('button',{name:'Check app update',exact:true}).click();
  await expect(page.getByText('No new app version found.',{exact:true})).toBeVisible();
  passed.push('Real worker fetch failure retains calendar; retry recovers');
  await other.close();
  await page.evaluate(()=>new Promise((resolve,reject)=>{const req=indexedDB.deleteDatabase('my-sg-calendar');req.onsuccess=()=>resolve(null);req.onerror=()=>reject(req.error);}));
  await context.setOffline(true);await page.reload();
  await expect(page.getByText('This calendar data is not saved here. Connect to download it.').first()).toBeVisible();
  await expect(page.getByText('Lunar information is unavailable for this date.',{exact:true})).toBeVisible();
  passed.push('Offline shell with evicted pack shows unavailable instead of fabricated data');
  const cold=await browser.newContext({offline:true});
  const coldPage=await cold.newPage();
  await assert.rejects(coldPage.goto(origin+'/calendar/'));
  passed.push('Cold offline first visit is unavailable');
  await writeFile(join(output,'evidence.json'),JSON.stringify({verifiedAt:new Date().toISOString(),browser:browser.version(),builds,basePath:'/calendar/',passed},null,2)+'\n');
  for(const item of passed)console.log(`PASS ${item}`);
} finally {
  await browser?.close();
  if(server)await new Promise(resolve=>server.close(resolve));
  if(!temporary.startsWith(root+sep))throw new Error('Unsafe cleanup path');
  await rm(temporary,{recursive:true,force:true});
}
