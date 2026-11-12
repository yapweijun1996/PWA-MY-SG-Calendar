import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChinesePack } from '../domain/chinese-calendar';
import type { HolidayPack } from '../domain/holidays';
import { regionalToday } from '../domain/civil-date';
import { DataValidationError, downloadPack, loadPack, loadPreferences, savePack, savePreferences, loadHolidays, saveHolidays, downloadHolidays, type Preferences } from './repository';

export function useCalendar() {
  const [pack,setPack]=useState<ChinesePack|null>(null);
  const [holidays,setHolidays]=useState<HolidayPack|null>(null);
  const [preferences,setPreferences]=useState<Preferences>(()=>({locale:'en',weekStart:1,selectedDate:regionalToday(),region:'SG'}));
  const [ready,setReady]=useState(false);
  const [busy,setBusy]=useState(false);
  const [persistent,setPersistent]=useState(true);
  const [refreshFailed,setRefreshFailed]=useState(false);
  const [invalidData,setInvalidData]=useState(false);
  const [online,setOnline]=useState(navigator.onLine);
  const saving=useRef(Promise.resolve());
  const refreshing=useRef(false);
  const preferenceFailed=useRef(false);
  useEffect(()=>{
    let active=true;
    const abort=new AbortController();
    void (async()=>{
      let current: ChinesePack|null=null;
      let currentHolidays: HolidayPack|null=null;
      try {
        const [stored,settings,events]=await Promise.allSettled([loadPack(),loadPreferences(),loadHolidays()]);
        current=stored.status==='fulfilled'?stored.value:null;
        currentHolidays=events.status==='fulfilled'?events.value:null;
        if(active){
          setPack(current);setHolidays(currentHolidays);
          if(settings.status==='fulfilled'&&settings.value)setPreferences(settings.value);
          if([stored,settings,events].some(result=>result.status==='rejected'))setPersistent(false);
        }
      } catch { if(active)setPersistent(false); }
      if(!current && navigator.onLine){
        if(active)setBusy(true);
        try {
          current=await downloadPack(import.meta.env.BASE_URL,abort.signal);
          try {await savePack(current);} catch {if(active)setPersistent(false);}
          if(active)setPack(current);
        } catch(error) {if(active && !abort.signal.aborted){setRefreshFailed(true);setInvalidData(error instanceof DataValidationError);}}
      }
      if(!currentHolidays && navigator.onLine){
        if(active)setBusy(true);
        try {
          currentHolidays=await downloadHolidays(import.meta.env.BASE_URL,abort.signal);
          try {await saveHolidays(currentHolidays);}catch{if(active)setPersistent(false);}
          if(active)setHolidays(currentHolidays);
        }catch(error){if(active&&!abort.signal.aborted){setRefreshFailed(true);setInvalidData(error instanceof DataValidationError);}}
      }
      if(active){setBusy(false);setReady(true);}
    })();
    const connectivity=()=>setOnline(navigator.onLine);
    window.addEventListener('online',connectivity);window.addEventListener('offline',connectivity);
    return ()=>{active=false;abort.abort();window.removeEventListener('online',connectivity);window.removeEventListener('offline',connectivity);};
  },[]);
  useEffect(()=>{
    if(!ready)return;
    saving.current=saving.current.then(()=>savePreferences(preferences)).then(()=>{preferenceFailed.current=false;}).catch(()=>{preferenceFailed.current=true;setPersistent(false);});
  },[preferences,ready]);
  const refresh=useCallback(async()=>{
    if(refreshing.current)return;
    refreshing.current=true;setBusy(true);setRefreshFailed(false);setInvalidData(false);
    try {
      const next=await downloadPack(import.meta.env.BASE_URL);
      const events=await downloadHolidays(import.meta.env.BASE_URL);
      let durable=true;
      try {await savePack(next);}catch{durable=false;}
      try {await saveHolidays(events);}catch{durable=false;}
      setPersistent(durable&&!preferenceFailed.current);
      setPack(next);
      setHolidays(events);
    } catch(error) {setRefreshFailed(true);setInvalidData(error instanceof DataValidationError);} finally {refreshing.current=false;setBusy(false);}
  },[]);
  return {pack,holidays,preferences,setPreferences,ready,busy,persistent,refreshFailed,invalidData,online,refresh,flushPreferences:async()=>{await saving.current;if(preferenceFailed.current)throw new Error('Preferences are not persisted');}};
}
