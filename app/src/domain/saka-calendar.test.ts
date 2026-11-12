import { expect,test } from 'vitest';
import { sakaLookup } from './saka-calendar';
import { addDays,civilInstant } from './civil-date';

// IMD explanation's month starts; 1957 introduction and IMD 2025 press release.
test.each([
  ['1957-03-22',1879,1,1],['2025-03-22',1947,1,1],['2026-03-21',1947,12,30],
  ['2026-03-22',1948,1,1],['2026-04-21',1948,2,1],['2026-05-22',1948,3,1],
  ['2026-06-22',1948,4,1],['2026-07-23',1948,5,1],['2026-08-23',1948,6,1],
  ['2026-09-23',1948,7,1],['2026-10-23',1948,8,1],['2026-11-22',1948,9,1],
  ['2026-12-22',1948,10,1],['2027-01-21',1948,11,1],['2027-02-20',1948,12,1],
  ['2024-03-21',1946,1,1],['2024-04-20',1946,1,31],['1900-03-22',1822,1,1],
  ['2000-03-21',1922,1,1],['2100-03-22',2022,1,1],
] as const)('Saka reference %s', (date,year,month,day)=>expect(sakaLookup(date)).toMatchObject({status:'available',year,month,day}));
test('independent ICU comparison over common/leap centuries and selected range',()=>{
  const formatter=new Intl.DateTimeFormat('en-u-ca-indian-nu-latn',{timeZone:'UTC',year:'numeric',month:'numeric',day:'numeric'});
  for(const year of [1900,2000,2024,2026,2027,2100]) {
    for(let date=`${year}-01-01`;date<=`${year}-12-31`;date=addDays(date,1)){
      const p=Object.fromEntries(formatter.formatToParts(civilInstant(date)).map(part=>[part.type,part.value]));
      expect(sakaLookup(date)).toMatchObject({year:Number(p.year),month:Number(p.month),day:Number(p.day)});
    }
  }
});
test('invalid dates and unsupported range remain unavailable',()=>{
  for(const date of ['1900-02-29','2026-13-01','1899-12-31','2101-01-01'])expect(sakaLookup(date).status).toBe('unavailable');
});
