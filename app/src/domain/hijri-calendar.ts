import {civilInstant,civilParts} from './civil-date';

export const hijriMethod={
  id:'islamic-civil',version:'tabular-friday-v1',start:'1900-01-01',end:'2100-12-31',
  source:'https://aa.usno.navy.mil/faq/islamic',
} as const;
// Type II, Friday epoch: Julian 622-07-16 = proleptic Gregorian 622-07-19.
const epoch=civilInstant('0622-07-19').getTime();
const leapYears=new Set([2,5,7,10,13,16,18,21,24,26,29]);
const leap=(year:number)=>leapYears.has((year-1)%30+1);

export function hijriLookup(date:string) {
  if(!civilParts(date))return {status:'unavailable',reason:'invalid-date'} as const;
  if(date<hijriMethod.start||date>hijriMethod.end)return {status:'unavailable',reason:'outside-range'} as const;
  const elapsed=Math.round((civilInstant(date).getTime()-epoch)/86400000);
  const cycles=Math.floor(elapsed/10631);
  let remaining=elapsed-cycles*10631;
  let year=cycles*30+1;
  while(remaining>=(leap(year)?355:354)){remaining-=leap(year)?355:354;year++;}
  let month=1;
  while(month<12){const length=month%2===1?30:29;if(remaining<length)break;remaining-=length;month++;}
  // This date labels the civil day's daytime portion; it is not a sunset clock.
  return {status:'available',method:hijriMethod.id,version:hijriMethod.version,year,month,day:remaining+1,confidence:'calculated-estimate',regionalVerification:'unavailable'} as const;
}
