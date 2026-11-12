// @vitest-environment node
import {readFileSync} from 'node:fs';
import {expect,test} from 'vitest';
import {holidayQuery,validateHolidayPack,type CalendarEvent} from './holidays';
import {regions} from './regions';
const raw=JSON.parse(readFileSync(new URL('../../public/data/holidays-2026-2027.json',import.meta.url),'utf8'));
const pack=validateHolidayPack(raw);
test('17 jurisdictions distinguish incomplete, unknown and verified empty coverage',()=>{
  expect(regions).toHaveLength(17);
  expect(holidayQuery('2026-02-19','SG',pack)).toEqual({coverage:'verified',records:[]});
  for(const region of regions.filter(r=>r.country==='MY')){
    for(const date of ['2026-02-17','2027-02-06']){
      const result=holidayQuery(date,region.id,pack);
      expect(result.coverage).toBe('incomplete');
      expect(result.records).toMatchObject([{country:'MY',nameKey:'chinese-new-year'}]);
    }
    expect(holidayQuery('2028-01-01',region.id,pack).coverage).toBe('unknown');
    expect(holidayQuery('2026-02-17',region.id,pack,'cultural-observance').coverage).toBe('unknown');
  }
  expect(holidayQuery('2028-01-01','SG',pack).coverage).toBe('unknown');
  expect(holidayQuery('2026-02-17','SG',null).coverage).toBe('unknown');
  expect(holidayQuery('2026-02-17','MY-99',pack).coverage).toBe('unknown');
  expect(holidayQuery('2026-02-17','SG',pack,'cultural-observance').coverage).toBe('incomplete');
});
test.each([
  ['2026-02-17','chinese-new-year'],['2026-03-21','hari-raya-puasa'],['2026-11-08','deepavali'],
  ['2027-03-10','hari-raya-puasa'],['2027-05-17','hari-raya-haji'],['2027-10-28','deepavali'],
])('MOM reference %s', (date,key)=>expect(holidayQuery(date,'SG',pack).records[0]?.nameKey).toBe(key));
test('only explicitly sourced observed dates exist and link to originals',()=>{
  expect(pack.records.filter(r=>r.country==='SG'&&r.kind==='observed-public-holiday').map(r=>r.date)).toEqual(['2026-06-01','2026-08-10','2026-11-09','2027-02-08']);
  const observed=holidayQuery('2027-02-08','SG',pack).records[0];
  expect(pack.records.find(r=>r.id===observed?.observedFor)?.date).toBe('2027-02-07');
  expect(holidayQuery('2026-03-23','SG',pack).records).toHaveLength(0);
});
test.each([
  ['2026-06-19','dragon-boat'],['2027-06-09','dragon-boat'],
  ['2026-09-25','mid-autumn'],['2027-09-15','mid-autumn'],
])('selected cultural fixture %s remains separate from official holidays',(date,key)=>{
  expect(holidayQuery(date,'SG',pack,'cultural-observance').records[0]?.nameKey).toBe(key);
  expect(holidayQuery(date,'SG',pack).records).toEqual([]);
});
test('national/local merge, provisional/conflict status and withdrawal are separate',()=>{
  const synthetic=structuredClone(pack);
  const national:CalendarEvent={...pack.records[0]!,id:'synthetic-national',eventId:'synthetic-event',country:'MY',subdivisionIds:[],status:'provisional'};
  const local:CalendarEvent={...national,id:'synthetic-local',subdivisionIds:['MY-01'],status:'disputed'};
  synthetic.records=[national,local,{...national,id:'withdrawn',eventId:'withdrawn',status:'withdrawn'}];
  expect(holidayQuery(national.date,'MY-01',synthetic).records).toMatchObject([{id:'synthetic-national',status:'disputed'}]);
  expect(holidayQuery(national.date,'MY-02',synthetic).records).toMatchObject([{id:'synthetic-national',status:'provisional'}]);
  expect(holidayQuery(national.date,'SG',synthetic).records).toEqual([]);
});
test('invalid identity, provenance, applicability and observed links are rejected',()=>{
  for(const mutate of [
    (p:typeof raw)=>p.records.push(p.records[0]),
    (p:typeof raw)=>{p.records[0].date='2026-02-30';},
    (p:typeof raw)=>{p.records[0].subdivisionIds=['MY-01'];},
    (p:typeof raw)=>{p.records[0].sourceRefs=['missing'];},
    (p:typeof raw)=>{p.records[0].id='<script>';},
    (p:typeof raw)=>{p.records[8].observedFor='missing';},
    (p:typeof raw)=>{p.sources[0].url='javascript:alert(1)';},
    (p:typeof raw)=>p.coverage.push(p.coverage[0]),
  ]){const next=structuredClone(raw);mutate(next);expect(()=>validateHolidayPack(next)).toThrow();}
});
