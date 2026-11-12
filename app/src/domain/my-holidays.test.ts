// @vitest-environment node
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {expect,test} from 'vitest';
import {normalizeMyHolidays} from '../../../scripts/my-holidays.mjs';
import {holidayQuery,validateHolidayPack} from './holidays';
import {eventName} from '../messages/events';
const curation=JSON.parse(readFileSync(new URL('../../../data/curated/my-holidays.json',import.meta.url),'utf8'));
const pack=validateHolidayPack(JSON.parse(readFileSync(new URL('../../public/data/holidays-2026-2027.json',import.meta.url),'utf8')));
const names=(date:string,region:string)=>holidayQuery(date,region,pack).records.map(row=>row.nameKey);

// Dates and state columns transcribed from the rendered BKPP combined tables.
test.each([
  ['2026-01-01','new-year',['MY-04','MY-05','MY-06','MY-07','MY-08','MY-10','MY-12','MY-13','MY-14','MY-15','MY-16']],
  ['2026-01-17','israk-mikraj',['MY-02','MY-05','MY-09','MY-11']],
  ['2026-02-19','awal-ramadan',['MY-01','MY-02']],
  ['2026-05-30','kaamatan',['MY-12','MY-15']],
  ['2026-06-01','gawai',['MY-13']],
  ['2026-11-08','deepavali',['MY-01','MY-02','MY-03','MY-04','MY-05','MY-06','MY-07','MY-08','MY-09','MY-10','MY-11','MY-12','MY-14','MY-15','MY-16']],
  ['2026-12-11','selangor-sultan-birthday',['MY-10']],
  ['2026-12-24','christmas-eve',['MY-12']],
  ['2027-01-06','israk-mikraj',['MY-02','MY-05','MY-09','MY-11']],
  ['2027-05-18','hari-raya-haji-day-2',['MY-02','MY-03','MY-09','MY-11']],
  ['2027-07-30','pahang-sultan-birthday',['MY-06']],
  ['2027-12-26','israk-mikraj',['MY-02','MY-05','MY-09','MY-11']],
])('BKPP state-column fixture %s %s',(date,key,expected)=>{
  const matching=Array.from({length:16},(_,i)=>`MY-${String(i+1).padStart(2,'0')}`).filter(region=>names(date,region).includes(key));
  expect(matching).toEqual(expected);
  expect(holidayQuery(date,'SG',pack).records.every(row=>row.country==='SG')).toBe(true);
});

test('Kedah signed amendment withdraws June and adds July with both sources',()=>{
  expect(names('2026-06-21','MY-02')).not.toContain('kedah-sultan-birthday');
  expect(holidayQuery('2026-07-05','MY-02',pack).records).toMatchObject([{nameKey:'kedah-sultan-birthday',status:'verified',sourceRefs:['my-bkpp-2026','my-kedah-birthday-amendment-2026']}]);
  expect(pack.records.find(row=>row.id==='my-kedah-sultan-birthday-2026-06-21')?.status).toBe('withdrawn');
  expect(names('2027-06-20','MY-02')).toContain('kedah-sultan-birthday');
  expect(names('2026-07-05','MY-01')).toEqual([]);
});

test('additional Eid conditions are resolved by declaration, never by arithmetic Hijri',()=>{
  for(const code of [1,2,3,4,5,6,7,8,9,10,11,12,14,15,16])expect(names('2026-03-20',`MY-${String(code).padStart(2,'0')}`)).toEqual(['additional-eid']);
  expect(names('2026-03-20','MY-13')).toEqual([]);
  expect(names('2026-03-20','SG')).toEqual([]);
  expect(names('2026-03-19','MY-03')).toEqual(['additional-eid']);
  expect(names('2026-03-19','MY-02')).toEqual([]);
  expect(names('2026-03-23','MY-01')).toEqual(['johor-sultan-birthday']);
  expect(names('2026-03-23','MY-04')).toEqual(['hari-raya-puasa-day-3']);
  expect(holidayQuery('2026-03-21','MY-01',pack).records[0]?.status).toBe('verified');
  expect(holidayQuery('2027-03-10','MY-01',pack).records[0]?.status).toBe('provisional');
});

test('special and observed dates retain their own jurisdiction and original link',()=>{
  expect(names('2026-02-01','MY-02')).toEqual(['thaipusam']);
  expect(names('2027-01-22','MY-02')).toEqual([]);
  expect(holidayQuery('2026-02-02','MY-07',pack).records).toMatchObject([{kind:'observed-public-holiday',observedFor:'my-thaipusam-2026-02-01'}]);
  expect(names('2026-02-02','MY-02')).toEqual([]);
  expect(holidayQuery('2026-10-26','MY-10',pack).records).toMatchObject([{kind:'observed-public-holiday',observedFor:'my-selangor-silver-jubilee-2026-10-25'}]);
  expect(names('2026-10-26','MY-14')).toEqual([]);
  expect(names('2027-05-17','MY-09').sort()).toEqual(['hari-raya-haji','perlis-raja-birthday']);
});

test('annual coverage is explicitly incomplete and all record names exist in four locales',()=>{
  expect(pack.records.filter(row=>row.country==='MY')).toHaveLength(108);
  const coverage=pack.coverage.filter(row=>row.region.startsWith('MY-')&&row.category==='public-holiday');
  expect(coverage).toHaveLength(32);
  for(const row of coverage){
    expect(row.status).toBe('incomplete');
    expect(row.sourceRefs).toContain(`my-bkpp-${row.year}`);
    for(const id of row.sourceRefs)expect(pack.sources.find(source=>source.id===id)?.years).toContain(row.year);
  }
  for(const record of pack.records)for(const locale of ['en','zh-Hans','ms','ta'] as const)expect(eventName(record.nameKey,locale)).not.toBe(record.nameKey);
  for(const reference of curation.factualReferences)expect(pack.sources.find(source=>source.id===reference.id)?.sha256).toBe(createHash('sha256').update(JSON.stringify(reference)).digest('hex'));
});

test('curation rejects missing evidence, sources, scope, correction targets and duplicate identities',()=>{
  for(const mutate of [
    (next:typeof curation)=>{next.annualRecords[0].sourceRefs=['missing'];},
    (next:typeof curation)=>{next.annualRecords[0].evidence='';},
    (next:typeof curation)=>{next.changes[0].targetId='missing';},
    (next:typeof curation)=>{next.changes[0].action='guess-replacement';},
    (next:typeof curation)=>{next.changes[6].record.subdivisionIds=[];},
    (next:typeof curation)=>{next.changes[6].record.subdivisionIds=['MY-99'];},
    (next:typeof curation)=>{next.changes[5].date='2026-06-21';},
    (next:typeof curation)=>{next.changes.push(next.changes[5]);},
    (next:typeof curation)=>{next.annualRecords.push(next.annualRecords[0]);},
  ]){const next=structuredClone(curation);mutate(next);expect(()=>normalizeMyHolidays(next)).toThrow();}
});
