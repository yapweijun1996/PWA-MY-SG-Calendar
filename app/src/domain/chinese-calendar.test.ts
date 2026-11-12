// @vitest-environment node
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { chineseLookup, validateChinesePack } from './chinese-calendar';
import { normalizeHko } from '../../../scripts/hko-normalize.mjs';

const raw = JSON.parse(readFileSync(new URL('../../public/data/chinese-2026-2027.json',import.meta.url),'utf8'));
const pack = validateChinesePack(raw);
// Expected values are transcribed from HKO annual PDF tables, not generated from CSV.
const references = [
  ['2026-01-01',11,13], ['2026-01-19',12,1], ['2026-02-16',12,29],
  ['2026-02-17',1,1], ['2026-03-19',2,1], ['2027-01-01',11,24],
  ['2027-01-08',12,1], ['2027-02-05',12,29], ['2027-02-06',1,1], ['2027-03-08',2,1],
] as const;
test.each(references)('PDF reference %s matches normalized lunar %i/%i',(date,month,day)=>{
  const result = chineseLookup(date,pack);
  expect(result.status).toBe('available');
  if(result.status==='available') expect([result.record.month,result.record.day]).toEqual([month,day]);
});
test('all 730 days resolve and out-of-range cells stay unavailable',()=>{
  for(const row of pack.records) expect(chineseLookup(row.date,pack).status).toBe('available');
  expect(chineseLookup('2025-12-31',pack)).toEqual({status:'unavailable',reason:'outside-range'});
  expect(chineseLookup('2028-01-01',pack).status).toBe('unavailable');
  expect(chineseLookup('2026-02-17',null)).toEqual({status:'unavailable',reason:'not-downloaded'});
});
test('year-cycle data changes at lunar new year, not January 1',()=>{
  expect(pack.records.find(r=>r.date==='2026-02-16')?.yearCycle).toBe('乙巳年');
  expect(pack.records.find(r=>r.date==='2026-02-17')?.yearCycle).toBe('丙午年');
});
test('invalid, duplicate and unproven records are rejected',()=>{
  for(const mutate of [
    (p: typeof raw)=>{p.records[1]=p.records[0];},
    (p: typeof raw)=>{p.records[0].day=31;},
    (p: typeof raw)=>{p.sources[0].sha256='bad';},
    (p: typeof raw)=>{p.records.pop();},
  ]){const next=structuredClone(raw);mutate(next);expect(()=>validateChinesePack(next)).toThrow();}
});
test('normalizer rejects unknown labels and preserves an explicit synthetic leap month',()=>{
  const csv=readFileSync(new URL('../../../data/raw/hko/2026.csv',import.meta.url),'utf8');
  expect(()=>normalizeHko(csv.replace('十一月','unknown'),2026)).toThrow();
  expect(normalizeHko(csv.replace('十一月','閏十一月'),2026)[0]?.leapMonth).toBe(true);
  expect(()=>normalizeHko(csv.replace('1-Jan-26','31-Feb-26'),2026)).toThrow();
});
