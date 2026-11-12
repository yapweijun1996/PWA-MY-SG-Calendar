import { civilParts, civilInstant } from './civil-date';

export const sakaMethod = {
  id: 'indian-national-saka', version: 'saka-gregorian-v1',
  start: '1900-01-01', end: '2100-12-31',
  source: 'https://packolkata.imd.gov.in/panchang/en/explanation',
} as const;
const isLeap=(year:number)=>year%4===0&&(year%100!==0||year%400===0);

export function sakaLookup(date:string) {
  const parts=civilParts(date);
  if(!parts)return {status:'unavailable',reason:'invalid-date'} as const;
  if(date<sakaMethod.start||date>sakaMethod.end)return {status:'unavailable',reason:'outside-range'} as const;
  let anchorYear=parts.year;
  const start=(year:number)=>`${year}-03-${isLeap(year)?'21':'22'}`;
  if(date<start(anchorYear))anchorYear--;
  let offset=Math.round((civilInstant(date).getTime()-civilInstant(start(anchorYear)).getTime())/86400000);
  const lengths=[isLeap(anchorYear)?31:30,31,31,31,31,31,30,30,30,30,30,30];
  let month=1;
  for(const length of lengths){if(offset<length)break;offset-=length;month++;}
  return {status:'available',method:sakaMethod.id,version:sakaMethod.version,year:anchorYear-78,month,day:offset+1} as const;
}
