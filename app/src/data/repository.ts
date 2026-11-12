import { validateChinesePack, type ChinesePack } from '../domain/chinese-calendar';
import { civilParts } from '../domain/civil-date';
import { validateHolidayPack, type HolidayPack } from '../domain/holidays';
import { isRegion } from '../domain/regions';

export const locales = ['en','zh-Hans','ms','ta'] as const;
export type Locale = typeof locales[number];
export interface Preferences { locale: Locale; weekStart: 0 | 1; selectedDate: string; region: string }
const DB_NAME = 'my-sg-calendar';
const STORE = 'state';
export class DataValidationError extends Error {}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve,reject)=>{
    if (!globalThis.indexedDB) { reject(new Error('Storage unavailable')); return; }
    const request = indexedDB.open(DB_NAME,1);
    let failed = false;
    request.onupgradeneeded = ()=>{request.result.createObjectStore(STORE);};
    request.onerror = ()=>reject(request.error ?? new Error('Storage unavailable'));
    request.onblocked = ()=>{failed=true;reject(new Error('Storage upgrade blocked'));};
    request.onsuccess = ()=>{
      if(failed){request.result.close();return;}
      request.result.onversionchange = ()=>request.result.close();
      resolve(request.result);
    };
  });
}

async function read(key: string): Promise<unknown> {
  const db = await openDatabase();
  return new Promise((resolve,reject)=>{
    const transaction = db.transaction(STORE,'readonly');
    const request = transaction.objectStore(STORE).get(key);
    transaction.oncomplete = ()=>{db.close();resolve(request.result);};
    transaction.onabort = transaction.onerror = ()=>{db.close();reject(transaction.error ?? new Error('Storage read failed'));};
  });
}

async function loadValidatedPack<T>(key:string,validate:(value:unknown)=>T): Promise<T|null> {
  const value=await read(`active-${key}`);
  if(value===undefined) return null;
  try {return validate(value);} catch {
    const previous=await read(`previous-${key}`);
    return previous===undefined ? null : validate(previous);
  }
}

async function saveValidatedPack<T extends {version:string}>(key:string,pack:T,validate:(value:unknown)=>T): Promise<void> {
  validate(pack);
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readwrite');
    const store=tx.objectStore(STORE);
    const prior=store.get(`active-${key}`);
    prior.onsuccess=()=>{
      if(prior.result !== undefined){
        try {const old=validate(prior.result);if(old.version!==pack.version)store.put(old,`previous-${key}`);} catch { /* Keep an already validated recovery pack. */ }
      }
      store.put(pack,`active-${key}`);
    };
    tx.oncomplete=()=>{db.close();resolve();};
    tx.onabort=tx.onerror=()=>{db.close();reject(tx.error ?? new Error('Storage write failed'));};
  });
}

function validPreferences(value:unknown):value is Preferences {
  if(!value || typeof value!=='object')return false;
  const p=value as Partial<Preferences>;
  return locales.includes(p.locale as Locale) && (p.weekStart===0 || p.weekStart===1)
    && typeof p.selectedDate==='string' && Boolean(civilParts(p.selectedDate)) && p.selectedDate>='1900-01-01' && p.selectedDate<='2100-12-31'
    && isRegion(p.region);
}
export async function loadPreferences(): Promise<Preferences | null> {
  const value=await read('preferences');return validPreferences(value)?value:null;
}

export async function savePreferences(preferences: Preferences): Promise<void> {
  if(!validPreferences(preferences))throw new Error('Invalid preferences');
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,'readwrite');
    tx.objectStore(STORE).put(preferences,'preferences');
    tx.oncomplete=()=>{db.close();resolve();};
    tx.onabort=tx.onerror=()=>{db.close();reject(tx.error ?? new Error('Preference save failed'));};
  });
}

async function downloadValidatedPack<T extends {version:string}>(baseUrl:string,file:string,validate:(value:unknown)=>T,signal?:AbortSignal): Promise<T> {
  const response=await fetch(`${baseUrl}data/manifest.json`,{cache:'no-store',...(signal?{signal}:{})});
  if(!response.ok)throw new Error('Calendar manifest unavailable');
  const manifest: unknown=await response.json().catch(()=>{throw new DataValidationError('Invalid manifest JSON');});
  if(!manifest || typeof manifest!=='object' || !('schemaVersion' in manifest) || manifest.schemaVersion!==1 || !('packs' in manifest) || !Array.isArray(manifest.packs))throw new DataValidationError('Invalid manifest');
  const entries=manifest.packs.filter(p=>p&&typeof p==='object'&&'file' in p&&p.file===file);
  const entry: unknown=entries.length===1?entries[0]:null;
  if(!entry || typeof entry!=='object' || !('file' in entry) || entry.file!==file
    || !('sha256' in entry) || typeof entry.sha256!=='string' || !/^[a-f0-9]{64}$/.test(entry.sha256))throw new DataValidationError('Invalid data entry');
  const data=await fetch(`${baseUrl}data/${entry.file}`,{cache:'no-store',...(signal?{signal}:{})});
  if(!data.ok)throw new Error('Calendar pack unavailable');
  const bytes=await data.arrayBuffer();
  if(bytes.byteLength>2_000_000)throw new DataValidationError('Calendar pack too large');
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  const hex=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
  if(hex!==entry.sha256)throw new DataValidationError('Calendar pack checksum mismatch');
  try {
    const pack=validate(JSON.parse(new TextDecoder().decode(bytes)));
    if(!('version' in entry) || pack.version!==entry.version)throw new Error('Calendar version mismatch');
    return pack;
  }catch(error){throw new DataValidationError(error instanceof Error?error.message:'Invalid pack');}
}

export const loadPack=()=>loadValidatedPack('chinese',validateChinesePack);
export const savePack=(pack:ChinesePack)=>saveValidatedPack('chinese',pack,validateChinesePack);
export const downloadPack=(base:string,signal?:AbortSignal)=>downloadValidatedPack(base,'chinese-2026-2027.json',validateChinesePack,signal);
export const loadHolidays=()=>loadValidatedPack('holidays',validateHolidayPack);
export const saveHolidays=(pack:HolidayPack)=>saveValidatedPack('holidays',pack,validateHolidayPack);
export const downloadHolidays=(base:string,signal?:AbortSignal)=>downloadValidatedPack(base,'holidays-2026-2027.json',validateHolidayPack,signal);
