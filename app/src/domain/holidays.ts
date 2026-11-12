import { civilParts } from './civil-date';
import { isRegion } from './regions';

export type EventKind='public-holiday'|'observed-public-holiday'|'cultural-observance';
export type EventStatus='verified'|'provisional'|'disputed'|'withdrawn';
export interface HolidaySource {
  country:'MY'|'SG';years:number[];updatedAt:string;
  rightsKind:'dataset-license'|'factual-reference';
  id:string;publisher:string;title:string;url:string;retrievedAt:string;verifiedAt:string;
  reviewer:string;sha256:string;license:string;attribution:string;
}
export interface CalendarEvent {
  id:string;eventId:string;date:string;country:'MY'|'SG';subdivisionIds:string[];
  kind:EventKind;observedFor?:string;nameKey:string;status:EventStatus;sourceRefs:string[];datasetVersion:string;
}
export interface Coverage {region:string;year:number;category:'public-holiday'|'cultural-observance';status:'verified'|'incomplete'|'unknown';sourceRefs:string[]}
export interface HolidayPack {schemaVersion:1;kind:'holidays';version:string;verifiedAt:string;sources:HolidaySource[];coverage:Coverage[];records:CalendarEvent[]}
const object=(v:unknown):v is Record<string,unknown>=>Boolean(v)&&typeof v==='object'&&!Array.isArray(v);
const text=(v:unknown):v is string=>typeof v==='string'&&v.length>0&&v.length<=1000;
const id=(v:unknown):v is string=>typeof v==='string'&&/^[a-z0-9][a-z0-9-]{0,100}$/.test(v);
const https=(v:unknown):v is string=>typeof v==='string'&&/^https:\/\//.test(v)&&(()=>{try{return Boolean(new URL(v).hostname);}catch{return false;}})();
const strings=(v:unknown):v is string[]=>Array.isArray(v)&&v.every(text)&&new Set(v).size===v.length;

export function validateHolidayPack(value:unknown):HolidayPack {
  if(!object(value)||value.schemaVersion!==1||value.kind!=='holidays'||!id(value.version)
    ||typeof value.verifiedAt!=='string'||!civilParts(value.verifiedAt)||!Array.isArray(value.sources)||!Array.isArray(value.records)||!Array.isArray(value.coverage))throw new Error('Invalid holiday pack');
  const sources=new Set<string>();
  for(const s of value.sources){
    if(!object(s)||!id(s.id)||sources.has(s.id)||!text(s.publisher)||!text(s.title)||!https(s.url)||!https(s.license)||!['dataset-license','factual-reference'].includes(String(s.rightsKind))
      ||(s.country!=='SG'&&s.country!=='MY')||!Array.isArray(s.years)||s.years.length===0||!s.years.every(y=>Number.isInteger(y)&&y>=1900&&y<=2100)
      ||typeof s.updatedAt!=='string'||!civilParts(s.updatedAt)||!text(s.reviewer)||!text(s.attribution)||typeof s.sha256!=='string'||!/^[a-f0-9]{64}$/.test(s.sha256)
      ||typeof s.retrievedAt!=='string'||!Number.isFinite(Date.parse(s.retrievedAt))||typeof s.verifiedAt!=='string'||!civilParts(s.verifiedAt))throw new Error('Invalid holiday source');
    sources.add(s.id);
  }
  const refs=(v:unknown)=>strings(v)&&v.length>0&&v.every(key=>sources.has(key));
  const coverageKeys=new Set<string>();
  for(const c of value.coverage){
    if(!object(c)||!isRegion(c.region)||typeof c.year!=='number'||!Number.isInteger(c.year)||c.year<1900||c.year>2100
      ||!['public-holiday','cultural-observance'].includes(String(c.category))||!['verified','incomplete','unknown'].includes(String(c.status))
      ||!strings(c.sourceRefs)||!c.sourceRefs.every(ref=>sources.has(ref))||(c.status!=='unknown'&&!refs(c.sourceRefs)))throw new Error('Invalid coverage');
    const key=`${c.region}:${c.year}:${c.category}`;if(coverageKeys.has(key))throw new Error('Duplicate coverage');coverageKeys.add(key);
  }
  const ids=new Set<string>();
  for(const r of value.records){
    if(!object(r)||!id(r.id)||ids.has(r.id)||!id(r.eventId)||!id(r.nameKey)||typeof r.date!=='string'||!civilParts(r.date)
      ||(r.country!=='MY'&&r.country!=='SG')||!strings(r.subdivisionIds)||!r.subdivisionIds.every(s=>isRegion(s)&&s.startsWith(r.country as string))
      ||!['public-holiday','observed-public-holiday','cultural-observance'].includes(String(r.kind))
      ||!['verified','provisional','disputed','withdrawn'].includes(String(r.status))||!refs(r.sourceRefs)||r.datasetVersion!==value.version
      ||(r.kind==='observed-public-holiday'?!id(r.observedFor):r.observedFor!==undefined))throw new Error('Invalid holiday record');
    ids.add(r.id);
  }
  const pack=value as unknown as HolidayPack;
  for(const record of pack.records){
    if(record.sourceRefs.some(id=>!pack.sources.some(source=>source.id===id&&source.country===record.country&&source.years.includes(Number(record.date.slice(0,4))))))throw new Error('Source does not cover record');
    if(!record.observedFor)continue;
    const original=pack.records.find(r=>r.id===record.observedFor);
    if(!original||original.kind!=='public-holiday'||original.eventId!==record.eventId||original.country!==record.country||original.date>=record.date
      ||record.subdivisionIds.some(id=>original.subdivisionIds.length>0&&!original.subdivisionIds.includes(id)))throw new Error('Invalid observed linkage');
  }
  return pack;
}

export function holidayQuery(date:string,region:string,pack:HolidayPack|null,category:Coverage['category']='public-holiday') {
  const year=civilParts(date)?.year;
  if(!year||!isRegion(region)||!pack)return {coverage:'unknown' as const,records:[] as CalendarEvent[]};
  const coverage=pack.coverage.find(c=>c.region===region&&c.year===year&&c.category===category)?.status??'unknown';
  const matches=pack.records.filter(r=>r.date===date&&r.country===region.slice(0,2)&&(!r.subdivisionIds.length||r.subdivisionIds.includes(region))&&r.status!=='withdrawn'
    &&(category==='cultural-observance'?r.kind==='cultural-observance':r.kind!=='cultural-observance'));
  const merged=new Map<string,CalendarEvent>();
  for(const record of matches){
    const key=`${record.eventId}:${record.date}:${record.kind}`;
    const prior=merged.get(key);
    const status=prior&&[prior.status,record.status].includes('disputed')?'disputed':prior&&[prior.status,record.status].includes('provisional')?'provisional':record.status;
    merged.set(key,prior?{...prior,status,sourceRefs:[...new Set([...prior.sourceRefs,...record.sourceRefs])]}:record);
  }
  return {coverage,records:[...merged.values()]};
}
