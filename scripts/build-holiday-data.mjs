import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {normalizeMyHolidays} from './my-holidays.mjs';
const raw=new URL('../data/raw/sg-holidays/',import.meta.url);
const source={...JSON.parse(await readFile(new URL('provenance.json',raw),'utf8')),country:'SG',years:[2026,2027],updatedAt:'2026-07-03',rightsKind:'dataset-license'};
const bytes=await readFile(new URL('source.json',raw));
if(createHash('sha256').update(bytes).digest('hex')!==source.sha256)throw new Error('Holiday source hash mismatch');
const names={'New Year’s Day':'new-year','Chinese New Year':'chinese-new-year','Hari Raya Puasa':'hari-raya-puasa','Good Friday':'good-friday','Labour Day':'labour-day','Hari Raya Haji':'hari-raya-haji','Vesak Day':'vesak','National Day':'sg-national-day','Deepavali':'deepavali','Christmas Day':'christmas'};
const rows=JSON.parse(bytes).result.records.filter(r=>r.date>='2026-01-01'&&r.date<='2027-12-31');
const links={'2026-06-01':'2026-05-31','2026-08-10':'2026-08-09','2026-11-09':'2026-11-08','2027-02-08':'2027-02-07'};
const records=rows.map(row=>{
  const observed=row.holiday.endsWith(' (Observed)');const name=row.holiday.replace(' (Observed)','');const key=names[name];
  if(!key)throw new Error(`Unreviewed holiday label: ${row.holiday}`);
  if(observed&&!links[row.date])throw new Error(`Unreviewed observed linkage: ${row.date}`);
  const id=`sg-${key}-${row.date}`;
  return {id,eventId:key,date:row.date,country:'SG',subdivisionIds:[],kind:observed?'observed-public-holiday':'public-holiday',...(observed?{observedFor:`sg-${key}-${links[row.date]}`} : {}),nameKey:key,status:'verified',sourceRefs:[source.id]};
});
if(records.length!==26)throw new Error('Annual coverage changed; review before generating');
const rulesBytes=await readFile(new URL('../data/curated/chinese-observances.json',import.meta.url));
const curation=JSON.parse(rulesBytes);
const lunarBytes=await readFile(new URL('../app/public/data/chinese-2026-2027.json',import.meta.url));
const lunar=JSON.parse(lunarBytes);
const culturalSources=curation.rules.map(rule=>({
  id:`rule-${rule.id}`,publisher:'Singapore Chinese Cultural Centre',title:`${rule.id} factual calendar rule`,
  country:'SG',years:[2026,2027],updatedAt:curation.verifiedAt,retrievedAt:curation.verifiedAt,rightsKind:'factual-reference',
  verifiedAt:curation.verifiedAt,reviewer:curation.reviewer,url:rule.url,license:rule.url,
  sha256:createHash('sha256').update(rulesBytes).digest('hex'),
  attribution:'Factual calendar rule referenced to Singapore Chinese Cultural Centre. No article text or artwork is reproduced. The fingerprint identifies the curated rule record, not the publisher page.',
}));
culturalSources.push({id:'hko-derived-observances',publisher:'Hong Kong Observatory',title:'HKO normalized date mapping for selected observances',country:'SG',years:[2026,2027],updatedAt:'2024-11-08',retrievedAt:lunar.sources[0].retrievedAt,verifiedAt:lunar.verifiedAt,reviewer:curation.reviewer,url:'https://www.hko.gov.hk/en/gts/time/conversion.htm',license:'https://data.gov.hk/en/terms-and-conditions',rightsKind:'dataset-license',sha256:createHash('sha256').update(lunarBytes).digest('hex'),attribution:lunar.sources[0].attribution});
for(const rule of curation.rules){
  const dates=lunar.records.filter(row=>row.month===rule.month&&row.day===rule.day&&!row.leapMonth);
  if(dates.length!==2)throw new Error(`Unexpected observance coverage: ${rule.id}`);
  for(const row of dates)records.push({id:`sg-${rule.id}-${row.date}`,eventId:rule.id,date:row.date,country:'SG',subdivisionIds:[],kind:'cultural-observance',nameKey:rule.id,status:'verified',sourceRefs:[`rule-${rule.id}`,'hko-derived-observances']});
}
const regions=['SG',...Array.from({length:16},(_,i)=>`MY-${String(i+1).padStart(2,'0')}`)];
const my=normalizeMyHolidays(JSON.parse(await readFile(new URL('../data/curated/my-holidays.json',import.meta.url),'utf8')));
records.push(...my.records);
const coverage=regions.flatMap(region=>[2026,2027].flatMap(year=>['public-holiday','cultural-observance'].map(category=>
  region!=='SG'&&category==='public-holiday'?my.coverage.find(row=>row.region===region&&row.year===year):
    {region,year,category,status:region==='SG'?(category==='public-holiday'?'verified':'incomplete'):'unknown',sourceRefs:region==='SG'?(category==='public-holiday'?[source.id]:culturalSources.map(s=>s.id)):[]})));
const sources=[source,...culturalSources,...my.sources];
const digest=createHash('sha256').update(JSON.stringify({normalization:'holidays-v1',sources,coverage,records})).digest('hex');
const version=`holidays-2026-2027-${digest.slice(0,12)}`;
const pack={schemaVersion:1,kind:'holidays',version,verifiedAt:source.verifiedAt,sources,coverage,records:records.map(record=>({...record,datasetVersion:version}))};
const output=new URL('../app/public/data/',import.meta.url);const json=JSON.stringify(pack)+'\n';
await writeFile(new URL('holidays-2026-2027.json',output),json);
const manifest=JSON.parse(await readFile(new URL('manifest.json',output),'utf8'));
manifest.packs=manifest.packs.filter(p=>p.file!=='holidays-2026-2027.json');
manifest.packs.push({file:'holidays-2026-2027.json',version,sha256:createHash('sha256').update(json).digest('hex')});
await writeFile(new URL('manifest.json',output),JSON.stringify(manifest,null,2)+'\n');
console.log(`Generated ${version}: ${records.length} records, explicit coverage for 17 jurisdictions.`);
