// @vitest-environment node
import { readFileSync } from 'node:fs';
import { IDBFactory, IDBObjectStore } from 'fake-indexeddb';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import { downloadPack, loadPack, loadPreferences, savePack, savePreferences, loadHolidays, saveHolidays } from './repository';
import { validateChinesePack } from '../domain/chinese-calendar';
import { holidayQuery, validateHolidayPack } from '../domain/holidays';

const bytes=readFileSync(new URL('../../public/data/chinese-2026-2027.json',import.meta.url));
const manifest=readFileSync(new URL('../../public/data/manifest.json',import.meta.url),'utf8');
const pack=validateChinesePack(JSON.parse(bytes.toString()));
const holidays=validateHolidayPack(JSON.parse(readFileSync(new URL('../../public/data/holidays-2026-2027.json',import.meta.url),'utf8')));
beforeEach(()=>vi.stubGlobal('indexedDB',new IDBFactory()));
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();});
async function corrupt(key:string,value:unknown) {
  await new Promise<void>((resolve,reject)=>{
    const open=indexedDB.open('my-sg-calendar',1);
    open.onsuccess=()=>{const db=open.result;const tx=db.transaction('state','readwrite');tx.objectStore('state').put(value,key);tx.oncomplete=()=>{db.close();resolve();};tx.onabort=()=>reject(tx.error);};
  });
}
test('atomic promotion retains a valid recovery pack and preferences',async()=>{
  const prefs={locale:'ta',weekStart:0,selectedDate:'2026-02-17',region:'SG'} as const;
  await savePreferences(prefs);await savePack(pack);
  const next={...pack,version:'hko-2026-2027-aaaaaaaaaaaa'};
  await savePack(next);expect((await loadPack())?.version).toBe(next.version);
  await corrupt('active-chinese',{broken:true});
  expect((await loadPack())?.version).toBe(pack.version);
  expect(await loadPreferences()).toEqual(prefs);
});
test('invalid replacement and aborted write leave the prior pack readable',async()=>{
  await savePack(pack);
  await expect(savePack({...pack,records:[]})).rejects.toThrow();
  const put=IDBObjectStore.prototype.put;
  const spy=vi.spyOn(IDBObjectStore.prototype,'put').mockImplementation(function(this:IDBObjectStore,...args:Parameters<typeof put>){
    const result=put.apply(this,args);this.transaction.abort();return result;
  });
  await expect(savePack({...pack,version:'hko-2026-2027-bbbbbbbbbbbb'})).rejects.toThrow();
  spy.mockRestore();expect((await loadPack())?.version).toBe(pack.version);
});

test('MY holiday pack promotion preserves prior coverage, preferences and Chinese data',async()=>{
  const previous=structuredClone(holidays);
  previous.version='holidays-before-my-import';
  previous.records=previous.records.filter(row=>row.country==='SG').map(row=>({...row,datasetVersion:previous.version}));
  previous.sources=previous.sources.filter(row=>row.country==='SG');
  previous.coverage=previous.coverage.map(row=>row.region==='SG'?row:{...row,status:'unknown',sourceRefs:[]});
  const prefs={locale:'ms',weekStart:1,selectedDate:'2026-07-05',region:'MY-02'} as const;
  await savePack(pack);await savePreferences(prefs);await saveHolidays(previous);
  expect(holidayQuery(prefs.selectedDate,prefs.region,await loadHolidays()).coverage).toBe('unknown');
  await saveHolidays(holidays);
  expect(holidayQuery(prefs.selectedDate,prefs.region,await loadHolidays()).records[0]?.id).toBe('my-kedah-sultan-birthday-2026-07-05');
  await expect(saveHolidays({...holidays,sources:[]})).rejects.toThrow();
  expect((await loadHolidays())?.version).toBe(holidays.version);
  await corrupt('active-holidays',{broken:true});
  expect((await loadHolidays())?.version).toBe(previous.version);
  expect((await loadPack())?.version).toBe(pack.version);
  expect(await loadPreferences()).toEqual(prefs);
});
test('storage absence, eviction and an incompatible newer schema are explicit',async()=>{
  expect(await loadPack()).toBeNull();
  vi.stubGlobal('indexedDB',undefined);await expect(loadPack()).rejects.toThrow('Storage unavailable');
  vi.stubGlobal('indexedDB',new IDBFactory());
  await new Promise<void>((resolve)=>{const req=indexedDB.open('my-sg-calendar',2);req.onsuccess=()=>{req.result.close();resolve();};});
  await expect(loadPack()).rejects.toThrow();
});
test('verified download rejects tampering and interrupted transport',async()=>{
  const fetchMock=vi.fn().mockResolvedValueOnce(new Response(manifest)).mockResolvedValueOnce(new Response(bytes));
  vi.stubGlobal('fetch',fetchMock);
  expect((await downloadPack('/calendar/')).version).toBe(pack.version);
  fetchMock.mockResolvedValueOnce(new Response(manifest)).mockResolvedValueOnce(new Response('{}'));
  await expect(downloadPack('/calendar/')).rejects.toThrow('checksum');
  fetchMock.mockRejectedValueOnce(new DOMException('Aborted','AbortError'));
  await expect(downloadPack('/calendar/')).rejects.toThrow('Aborted');
});
