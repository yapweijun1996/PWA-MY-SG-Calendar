import {expect,test} from 'vitest';
import {hijriLookup} from './hijri-calendar';
import {addDays,civilInstant} from './civil-date';

// Independently retrieved from USNO /api/observances/islamic?year=2026 and 2027.
test.each([
  ['2026-02-18',1447,9,1],['2026-03-20',1447,10,1],['2026-06-17',1448,1,1],
  ['2027-02-08',1448,9,1],['2027-03-10',1448,10,1],['2027-06-06',1449,1,1],
] as const)('USNO tabular reference %s',(date,year,month,day)=>expect(hijriLookup(date)).toMatchObject({year,month,day}));

test('independent ICU civil-Hijri comparison spans a complete 30-year leap cycle',()=>{
  const format=new Intl.DateTimeFormat('en-u-ca-islamic-civil-nu-latn',{timeZone:'UTC',year:'numeric',month:'numeric',day:'numeric'});
  for(let date='2000-01-01';date<='2030-12-31';date=addDays(date,1)){
    const p=Object.fromEntries(format.formatToParts(civilInstant(date)).map(part=>[part.type,part.value]));
    expect(hijriLookup(date)).toMatchObject({year:Number(p.year),month:Number(p.month),day:Number(p.day),confidence:'calculated-estimate',regionalVerification:'unavailable'});
  }
});
test('range boundaries and invalid civil dates are explicit',()=>{
  expect(hijriLookup('1900-01-01').status).toBe('available');
  expect(hijriLookup('2100-12-31').status).toBe('available');
  for(const date of ['1899-12-31','2101-01-01','2026-02-29','bad'])expect(hijriLookup(date).status).toBe('unavailable');
});
