import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [390, 768, 1440]) {
  test(`calendar, keyboard and four locales at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to calendar' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
    await page.getByRole('button',{name:'Settings',exact:true}).click();
    await page.getByLabel('Go to date').fill('2026-02-17');
    await page.getByRole('button',{name:'Close',exact:true}).click();
    await expect(page.getByRole('button',{name:'Settings',exact:true})).toBeFocused();
    await expect(page.getByRole('heading',{level:1})).toHaveText('February 2026');
    await expect(page.locator('.lunar-detail')).toHaveText('Month 1 · Day 1');
    const chosen=page.locator('button[data-date="2026-02-17"]');
    await chosen.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('button[data-date="2026-02-18"]')).toBeFocused();
    await expect(page.locator('[aria-selected="true"] button')).toHaveAttribute('data-date','2026-02-17');
    await page.keyboard.press('Enter');
    await expect(page.locator('[aria-selected="true"] button')).toHaveAttribute('data-date','2026-02-18');
    for(const locale of ['zh-Hans','ms','ta','en']){
      await page.locator('.language-label select').selectOption(locale);
      await expect(page.locator('html')).toHaveAttribute('lang',locale);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await expect(page.locator('[aria-selected="true"] button')).toHaveAttribute('data-date','2026-02-18');
      await page.screenshot({path:test.info().outputPath(`calendar-${width}-${locale}.png`),fullPage:true});
    }
    await page.reload();
    await expect(page.locator('[aria-selected="true"] button')).toHaveAttribute('data-date','2026-02-18');
    expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}
test('unavailable date and failed refresh preserve prior data',async({page})=>{
  await page.goto('/');
  await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByLabel('Go to date').fill('2028-01-01');
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await expect(page.getByText('Lunar information is unavailable for this date.',{exact:true})).toBeVisible();
  await page.route('**/data/manifest.json',route=>route.fulfill({status:200,body:'{}',contentType:'application/json'}));
  await page.getByRole('button',{name:'Download / refresh data'}).click();
  await expect(page.getByRole('alert')).toContainText('failed validation');
  await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();
});
test('rapid region changes and reload retain date without cross-region holidays',async({page})=>{
  await page.goto('/');
  await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByLabel('Go to date').fill('2026-02-17');
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await expect(page.locator('[data-event-id="sg-chinese-new-year-2026-02-17"]')).toBeVisible();
  for(const region of ['MY-01','SG','MY-12','MY-16','SG','MY-01']){
    await page.getByRole('combobox',{name:'Region',exact:true}).selectOption(region);
    await expect(page.locator('.event')).toHaveCount(1);
    await expect(page.locator('.event')).toHaveAttribute('data-event-id',`${region==='SG'?'sg':'my'}-chinese-new-year-2026-02-17`);
  }
  await page.locator('.language-label select').selectOption('zh-Hans');
  await page.reload();
  await expect(page.locator('.region-label select')).toHaveValue('MY-01');
  await expect(page.locator('[aria-selected="true"] button')).toHaveAttribute('data-date','2026-02-17');
  await expect(page.locator('.event')).toHaveAttribute('data-event-id','my-chinese-new-year-2026-02-17');
});

test('MY amendments, incomplete coverage and source scope survive region and year changes',async({page})=>{
  await page.setViewportSize({width:390,height:900});
  await page.goto('/');
  await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();
  const jump=async(date:string)=>{
    await page.getByRole('button',{name:'Settings',exact:true}).click();
    await page.getByLabel('Go to date').fill(date);
    await page.getByRole('button',{name:'Close',exact:true}).click();
  };
  await page.locator('.region-label select').selectOption('MY-02');
  await jump('2026-06-21');
  await expect(page.locator('.event')).toHaveCount(0);
  await expect(page.getByText('Annual holidays and selected amendments are included.',{exact:false})).toBeVisible();
  await expect(page.getByText('No applicable records in this verified coverage.',{exact:true})).toHaveCount(0);
  await jump('2026-07-05');
  await expect(page.locator('[data-event-id="my-kedah-sultan-birthday-2026-07-05"]')).toBeVisible();
  await expect(page.locator('[data-source-id="my-kedah-birthday-amendment-2026"]')).toBeVisible();
  for(const locale of ['zh-Hans','ms','ta','en']){
    await page.locator('.language-label select').selectOption(locale);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await expect(page.locator('.event h3')).not.toHaveText('kedah-sultan-birthday');
  }
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  await page.screenshot({path:test.info().outputPath('kedah-corrected.png'),fullPage:true});
  await jump('2026-11-08');
  await page.locator('.region-label select').selectOption('MY-12');
  await expect(page.locator('[data-event-id="my-deepavali-2026-11-08"]')).toBeVisible();
  await page.locator('.region-label select').selectOption('MY-13');
  await expect(page.locator('.event')).toHaveCount(0);
  await expect(page.locator('[data-source-id="my-kedah-birthday-amendment-2026"]')).toHaveCount(0);
  await page.locator('.region-label select').selectOption('MY-02');
  await jump('2027-06-20');
  await expect(page.locator('[data-event-id="my-kedah-sultan-birthday-2027-06-20"]')).toBeVisible();
  await expect(page.locator('[data-source-id]')).toHaveCount(1);
  await expect(page.locator('[data-source-id="my-bkpp-2027"]')).toBeVisible();
  await page.reload();
  await expect(page.locator('.region-label select')).toHaveValue('MY-02');
  await expect(page.locator('[data-event-id="my-kedah-sultan-birthday-2027-06-20"]')).toBeVisible();
});
test('320px reflow, reduced motion, settings accessibility and storage denial',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(window,'indexedDB',{value:undefined}));
  await page.setViewportSize({width:320,height:800});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.locator('.lunar-detail')).toBeVisible();
  await expect(page.getByText('Session only — storage is unavailable. Offline data is not guaranteed.').first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Settings',exact:true})).toBeFocused();
});
test('verification age stays stale after a fresh download',async({page})=>{
  await page.clock.setFixedTime(new Date('2027-06-01T12:00:00Z'));
  await page.goto('/');
  await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();
  await expect(page.getByText('The source verification is over 90 days old. Check for updates.')).toBeVisible();
  await page.getByRole('button',{name:'Download / refresh data'}).click();
  await expect(page.getByRole('button',{name:'Download / refresh data'})).toBeEnabled();
  await expect(page.getByText('The source verification is over 90 days old. Check for updates.')).toBeVisible();
});
test('civil date and lunar result are invariant across device timezones',async({browser,baseURL})=>{
  for(const timezoneId of ['Pacific/Honolulu','UTC','Asia/Singapore']){
    const context=await browser.newContext({timezoneId});
    const page=await context.newPage();
    await page.goto(baseURL!);
    await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();
    await page.getByRole('button',{name:'Settings',exact:true}).click();
    await page.getByLabel('Go to date').fill('2026-02-17');
    await page.getByRole('button',{name:'Close',exact:true}).click();
    await expect(page.locator('.lunar-detail')).toHaveText('Month 1 · Day 1');
    await expect(page.locator('[data-saka]')).toHaveAttribute('data-saka','1947-11-28');
    await expect(page.locator('[data-hijri]')).toHaveAttribute('data-hijri','1447-8-29');
    await context.close();
  }
});
test('calculated Hijri never creates or moves an official holiday',async({page})=>{
  await page.goto('/');
  await expect(page.getByText('Saved on this device',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByLabel('Go to date').fill('2026-03-20');
  await page.getByRole('button',{name:'Close',exact:true}).click();
  await expect(page.locator('[data-hijri]')).toHaveAttribute('data-hijri','1447-10-1');
  await expect(page.locator('.event')).toHaveCount(0);
  await expect(page.getByText('Arithmetic estimate.',{exact:false})).toBeVisible();
  await page.locator('button[data-date="2026-03-21"]').click();
  await expect(page.locator('[data-hijri]')).toHaveAttribute('data-hijri','1447-10-2');
  await expect(page.locator('[data-event-id="sg-hari-raya-puasa-2026-03-21"]')).toBeVisible();
});
