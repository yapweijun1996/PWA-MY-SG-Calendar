import {holidayQuery,type CalendarEvent,type HolidayPack} from './domain/holidays';
import {sakaLookup,sakaMethod} from './domain/saka-calendar';
import {hijriLookup,hijriMethod} from './domain/hijri-calendar';
import {catalogs} from './messages/catalogs';
import {eventName} from './messages/events';
import type {Locale} from './data/repository';

export function RegionalDetails({date,region,locale,pack}:{date:string;region:string;locale:Locale;pack:HolidayPack|null}) {
  const t=catalogs[locale];
  const saka=sakaLookup(date);
  const hijri=hijriLookup(date);
  const holidays=holidayQuery(date,region,pack);
  const cultural=holidayQuery(date,region,pack,'cultural-observance');
  const sourceRefs=new Set(pack?.coverage.filter(row=>row.region===region&&row.year===Number(date.slice(0,4))).flatMap(row=>row.sourceRefs));
  return <section className="regional-details" aria-label={t.holidays}>
    <div>
      <h2>{t.saka}</h2>
      {saka.status==='available'?<p data-saka={`${saka.year}-${saka.month}-${saka.day}`}>{t.year} {saka.year} · {t.month} {saka.month} · {t.day} {saka.day}</p>:<p>{t.unknownLabel}</p>}
      <p className="small">{t.sakaNote}</p>
      <a href={sakaMethod.source} rel="noreferrer" target="_blank">{t.source}: IMD</a>
    </div>
    <div>
      <h2>{t.hijri}</h2>
      {hijri.status==='available'?<p data-hijri={`${hijri.year}-${hijri.month}-${hijri.day}`}>{t.year} {hijri.year} · {t.month} {hijri.month} · {t.day} {hijri.day}</p>:<p>{t.unknownLabel}</p>}
      <p className="small">{t.hijriEstimate}</p>
      <a href={hijriMethod.source} target="_blank" rel="noreferrer">{t.source}: USNO</a>
      <details className="small"><summary>{t.details}</summary><p>{hijriMethod.id} · {hijriMethod.version} · 1900–2100</p><p>{t.hijriDayBoundary}</p></details>
    </div>
    <div className="event-section">
      <h2>{t.holidays}</h2>
      <h3>{t.publicHoliday}</h3>
      {holidays.coverage!=='verified'&&<p className="notice">{holidays.coverage==='incomplete'?t.coverageIncomplete:t.coverageUnknown}</p>}
      {holidays.coverage==='verified'&&holidays.records.length===0&&<p>{t.noEvents}</p>}
      {holidays.records.map(event=><EventDetail key={event.id} event={event} locale={locale} pack={pack}/>)}
      <h3>{t.observance}</h3>
      {cultural.coverage!=='verified'&&<p className="small">{t.culturalIncomplete}</p>}
      {cultural.records.map(event=><EventDetail key={event.id} event={event} locale={locale} pack={pack}/>)}
      {pack?.sources.filter(source=>sourceRefs.has(source.id)).map(source=><details className="small" key={source.id} data-source-id={source.id}>
        <summary>{t.source}: {source.publisher}</summary>
        <p lang="en">{source.title}</p>
        <p lang="en">{source.attribution}</p>
        <a href={source.license} target="_blank" rel="noreferrer">{source.rightsKind==='dataset-license'?t.sourceTerms:t.source}</a>
        <p>{t.version}: {pack.version}</p>
      </details>)}
    </div>
  </section>;
}

function EventDetail({event,locale,pack}:{event:CalendarEvent;locale:Locale;pack:HolidayPack|null}) {
  const t=catalogs[locale];
  return <article className="event" data-event-id={event.id}>
    <h3>{eventName(event.nameKey,locale)}</h3>
    <p className="tag">{event.kind==='observed-public-holiday'?t.observed:event.kind==='cultural-observance'?t.observance:t.publicHoliday}</p>
    {event.status!=='verified'&&<p>{event.status==='disputed'?t.disputed:t.provisional}</p>}
    {event.observedFor&&<p className="small">{t.observed}: {pack?.records.find(r=>r.id===event.observedFor)?.date}</p>}
    {event.sourceRefs.map(id=>{
      const source=pack?.sources.find(s=>s.id===id);
      return source?<p key={id} className="small"><a href={source.url} target="_blank" rel="noreferrer">{source.publisher}</a> · {t.verified}: {source.verifiedAt}</p>:null;
    })}
  </article>;
}
