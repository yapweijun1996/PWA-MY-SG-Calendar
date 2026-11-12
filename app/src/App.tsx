import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { addDays, addMonths, civilInstant, civilParts, monthDays, regionalToday, weekday } from './domain/civil-date';
import { chineseLookup } from './domain/chinese-calendar';
import { catalogs, lunarLabel } from './messages/catalogs';
import { locales, type Locale } from './data/repository';
import { useCalendar } from './data/use-calendar';
import { usePwa } from './pwa/use-pwa';
import { regions } from './domain/regions';
import { RegionalDetails } from './RegionalDetails';

export function App() {
  const data=useCalendar();
  const pwa=usePwa(data.flushPreferences);
  const {preferences,pack}=data;
  const {locale,selectedDate,weekStart,region}=preferences;
  const t=catalogs[locale];
  const [now,setNow]=useState(()=>Date.now());
  const today=regionalToday(()=>new Date(now));
  const [browsing,setBrowsing]=useState<string|null>(null);
  const [focused,setFocused]=useState<string|null>(null);
  const [dateError,setDateError]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const settingsButton=useRef<HTMLButtonElement>(null);
  const grid=useRef<HTMLTableElement>(null);
  const viewDate=browsing??selectedDate;
  const days=monthDays(viewDate,weekStart);
  const activeFocus=focused && days.includes(focused)?focused:days.includes(selectedDate)?selectedDate:days.find(d=>d.slice(0,7)===viewDate.slice(0,7))??viewDate;
  const result=chineseLookup(selectedDate,pack);
  const format=(date:string,options:Intl.DateTimeFormatOptions)=>new Intl.DateTimeFormat(locale,{timeZone:'UTC',...options}).format(civilInstant(date));
  const monthTitle=format(viewDate,{month:'long',year:'numeric'});
  const stale=pack ? now-civilInstant(pack.verifiedAt).getTime()>90*86400000 : false;
  useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),60000);return ()=>window.clearInterval(timer);},[]);
  useEffect(()=>{document.documentElement.lang=locale;document.title=t.appName;},[locale,t.appName]);
  function select(date:string){
    data.setPreferences(previous=>({...previous,selectedDate:date}));
    setBrowsing(date);setFocused(date);
  }
  function moveMonth(offset:number){setBrowsing(addMonths(viewDate,offset));setFocused(null);}
  function gridKey(event:KeyboardEvent<HTMLButtonElement>,date:string){
    const offsets:Record<string,number>={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7,Home:-((weekday(date)-weekStart+7)%7),End:6-((weekday(date)-weekStart+7)%7)};
    let next:string|undefined;
    if(event.key in offsets)next=addDays(date,offsets[event.key]??0);
    if(event.key==='PageUp')next=addMonths(date,event.shiftKey?-12:-1);
    if(event.key==='PageDown')next=addMonths(date,event.shiftKey?12:1);
    if(!next || next<'1900-01-01' || next>'2100-12-31')return;
    event.preventDefault();setFocused(next);setBrowsing(next);
    requestAnimationFrame(()=>grid.current?.querySelector<HTMLButtonElement>('button[data-date="'+next+'"]')?.focus());
  }
  function changeDate(value:string){
    if(!civilParts(value)||value<'1900-01-01'||value>'2100-12-31'){setDateError(true);return;}
    setDateError(false);select(value);
  }
  const weekLabels=Array.from({length:7},(_,i)=>format(addDays('2026-02-01',(i+weekStart)%7),{weekday:'short'}));
  return <>
    <div inert={pwa.status==='updating'}>
    <a className="skip-link" href="#calendar-main">{t.skip}</a>
    <header className="app-header"><div className="brand">{t.appName}</div><div className="header-actions"><span className="network">{data.online?t.online:t.offline}</span><label className="language-label">{t.language}<select value={locale} onChange={event=>data.setPreferences(p=>({...p,locale:event.target.value as Locale}))}>{locales.map(code=><option key={code} value={code}>{{en:'English','zh-Hans':'简体中文',ms:'Bahasa Melayu',ta:'தமிழ்'}[code]}</option>)}</select></label></div></header>
    <main id="calendar-main" tabIndex={-1}>
      {pwa.status==='available'&&!pwa.deferred&&<section className="notice update-banner" aria-label={t.newVersion}><p>{t.newVersion}</p><button onClick={()=>void pwa.update()}>{t.update}</button><button onClick={pwa.defer}>{t.later}</button></section>}
      {pwa.status==='failed'&&<p className="notice" role="alert">{t.updateFailed}</p>}
      <label className="region-label">{t.region}<select value={region} onChange={event=>data.setPreferences(p=>({...p,region:event.target.value}))}>{regions.map(r=><option key={r.id} value={r.id}>{r.name} ({r.id})</option>)}</select></label>
      <section className="month-toolbar"><div><p className="eyebrow">{t.title}</p><h1 aria-live="polite">{monthTitle}</h1></div><div className="toolbar-actions"><button aria-label={t.previous} disabled={viewDate.slice(0,7)<='1900-01'} onClick={()=>moveMonth(-1)}>←</button><button onClick={()=>select(today)}>{t.today}</button><button aria-label={t.next} disabled={viewDate.slice(0,7)>='2100-12'} onClick={()=>moveMonth(1)}>→</button><button ref={settingsButton} onClick={()=>dialog.current?.showModal()}>{t.settings}</button></div></section>
      {!data.ready&&<p role="status">{t.loading}</p>}
      {data.ready&&!pack&&<p className="notice" role="status">{t.missing}</p>}
      {!data.persistent&&<p className="notice" role="status">{t.session}</p>}
      {data.refreshFailed&&<p className="notice" role="alert">{data.invalidData?t.invalidData:t.refreshFailed}</p>}
      {stale&&<p className="notice">{t.stale}</p>}
      <div className="calendar-layout"><section className="calendar-panel" aria-label={monthTitle}>
        <table ref={grid} role="grid" aria-label={monthTitle} aria-describedby="keyboard-help"><thead><tr>{weekLabels.map((label,i)=><th scope="col" key={i}><span aria-hidden="true">{label}</span><span className="sr-only">{format(addDays('2026-02-01',(i+weekStart)%7),{weekday:'long'})}</span></th>)}</tr></thead><tbody>{Array.from({length:6},(_,row)=><tr key={row}>{days.slice(row*7,row*7+7).map(date=>{
          const lunar=chineseLookup(date,pack);const selected=date===selectedDate;const isToday=date===today;
          const label=lunar.status==='available'?lunarLabel(lunar.record.month,lunar.record.day,lunar.record.leapMonth,locale):'—';
          const accessibleLunar=lunar.status==='available'?t.chinese+' '+lunar.record.month+'/'+lunar.record.day+(lunar.record.leapMonth?' '+t.leap:''):t.unavailable;
          return <td key={date} role="gridcell" aria-selected={selected}><button data-date={date} disabled={date<'1900-01-01'||date>'2100-12-31'} tabIndex={date===activeFocus?0:-1} aria-current={isToday?'date':undefined} aria-label={format(date,{dateStyle:'full'})+'; '+accessibleLunar} className={['day',selected?'selected':'',isToday?'today':'',date.slice(0,7)!==viewDate.slice(0,7)?'adjacent':''].join(' ')} onFocus={()=>setFocused(date)} onKeyDown={event=>gridKey(event,date)} onClick={()=>select(date)}><span className="civil-day">{Number(date.slice(-2))}</span><span className="lunar-day" aria-hidden="true">{label}</span>{selected&&<span className="selected-mark" aria-hidden="true">✓</span>}{isToday&&<span className="today-mark" aria-hidden="true">•</span>}</button></td>;
        })}</tr>)}</tbody></table>
        <p id="keyboard-help" className="keyboard-help">{t.help}</p>
      </section>
      <aside className="day-detail" aria-label={t.details}><p className="eyebrow">{t.selected}</p><p className="date-number">{Number(selectedDate.slice(-2))}</p><h2>{format(selectedDate,{dateStyle:'full'})}</h2><span className="tag">{t.chinese}</span>{result.status==='available'?<><p className="lunar-detail">{t.month} {result.record.month} · {t.day} {result.record.day}{result.record.leapMonth?' · '+t.leap:''}</p><p className="muted" lang="zh-Hans">{result.record.yearCycle} · {result.record.zodiac.replace('龍','龙').replace('馬','马').replace('雞','鸡').replace('豬','猪')}</p></>:<p className="muted">{t.unavailable}</p>}<hr/><h3>{t.source}</h3><p>{t.sourceName}</p><p className="muted">{t.range}</p><p className="small">{t.notHoliday}</p>{pack&&<><p className="small">{t.verified}: {pack.verifiedAt}</p><p className="small version">{t.version}: {pack.version}</p></>}{pack&&<details className="small"><summary>{t.source}</summary><p lang="en">{pack.sources[0]?.attribution}</p><p>hko-table · 2026–2027</p></details>}<a href="https://data.gov.hk/en/terms-and-conditions" target="_blank" rel="noreferrer">{t.sourceTerms}</a></aside></div>
      <RegionalDetails date={selectedDate} region={region} locale={locale} pack={data.holidays}/>
      <section className="data-bar" aria-label={t.dataState}><p>{data.ready&&pack?(data.persistent?t.cached:t.session):t.missing}</p><button disabled={data.busy||!data.online} onClick={()=>void data.refresh()}>{data.busy?t.refreshing:t.refresh}</button></section>
      <p className="footer-note">{t.allData}</p>
      <section className="app-update"><button disabled={pwa.status==='checking'||pwa.status==='updating'} onClick={()=>void (pwa.status==='available'?pwa.update():pwa.check())}>{pwa.status==='available'?t.update:pwa.status==='checking'?t.updateChecking:t.checkUpdate}</button>{pwa.status==='current'&&<p role="status">{t.noUpdate}</p>}{pwa.status==='unsupported'&&<p role="status">{t.notSupported}</p>}<small className="version" data-build={pwa.build}>{pwa.build}</small></section>
    </main>
    <dialog ref={dialog} onClose={()=>settingsButton.current?.focus()} aria-labelledby="settings-title"><div className="dialog-heading"><h2 id="settings-title">{t.settings}</h2><button onClick={()=>dialog.current?.close()}>{t.close}</button></div><label>{t.weekStart}<select value={weekStart} onChange={event=>data.setPreferences(p=>({...p,weekStart:Number(event.target.value) as 0|1}))}><option value="1">{t.monday}</option><option value="0">{t.sunday}</option></select></label><label>{t.jump}<input type="date" min="1900-01-01" max="2100-12-31" value={selectedDate} onChange={event=>changeDate(event.target.value)} aria-invalid={dateError}/></label>{dateError&&<p role="alert">{t.dateInvalid}</p>}<hr/><h3>{t.about}</h3><p>{t.license}</p><p className="small">{t.translation}</p><p className="small">{t.install}</p></dialog>
    </div>
    {pwa.status==='updating'&&<div className="update-overlay" role="alert" aria-busy="true"><p>{t.updating}</p></div>}
  </>;
}
