import { addDays, civilParts } from './civil-date';

export interface Source {
  id: string; year: number; file: string; url: string; sha256: string;
  retrievedAt: string; terms: string; attribution: string;
}
export interface LunarRecord {
  date: string; month: number; day: number; leapMonth: boolean;
  yearCycle: string; zodiac: string; sourceId: string;
}
export interface ChinesePack {
  schemaVersion: 1; kind: 'chinese-calendar'; method: 'hko-table'; version: string;
  start: string; end: string; verifiedAt: string; sources: Source[]; records: LunarRecord[];
}
export type CalendarResult = { status: 'available'; method: 'hko-table'; version: string; record: LunarRecord }
  | { status: 'unavailable'; reason: 'invalid-date' | 'not-downloaded' | 'outside-range' };

function object(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === 'object' && !Array.isArray(value); }

export function validateChinesePack(value: unknown): ChinesePack {
  if (!object(value) || value.schemaVersion !== 1 || value.kind !== 'chinese-calendar' || value.method !== 'hko-table'
    || typeof value.version !== 'string' || !/^hko-2026-2027-[a-f0-9]{12}$/.test(value.version)
    || value.start !== '2026-01-01' || value.end !== '2027-12-31'
    || typeof value.verifiedAt !== 'string' || !civilParts(value.verifiedAt)
    || !Array.isArray(value.sources) || value.sources.length !== 2
    || !Array.isArray(value.records) || value.records.length !== 730) throw new Error('Invalid Chinese calendar pack');
  const sources = new Set<string>();
  for (const source of value.sources) {
    if (!object(source) || (source.year !== 2026 && source.year !== 2027) || source.id !== `hko-${source.year}`
      || source.file !== `${source.year}.csv` || source.url !== `https://data.weather.gov.hk/weatherAPI/hko_data/calendar/nongli_calendar_${source.year}.csv`
      || typeof source.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(source.sha256)
      || typeof source.retrievedAt !== 'string' || !Number.isFinite(Date.parse(source.retrievedAt))
      || source.terms !== 'https://data.gov.hk/en/terms-and-conditions'
      || typeof source.attribution !== 'string' || source.attribution.length < 20 || source.attribution.length > 500
      || sources.has(String(source.id))) throw new Error('Invalid source provenance');
    sources.add(String(source.id));
  }
  for (let index = 0; index < value.records.length; index++) {
    const row: unknown = value.records[index];
    if (!object(row) || row.date !== addDays(value.start, index) || row.sourceId !== `hko-${String(row.date).slice(0,4)}`
      || typeof row.month !== 'number' || !Number.isInteger(row.month) || row.month < 1 || row.month > 12
      || typeof row.day !== 'number' || !Number.isInteger(row.day) || row.day < 1 || row.day > 30
      || typeof row.leapMonth !== 'boolean' || typeof row.yearCycle !== 'string' || !/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]年$/.test(row.yearCycle)
      || typeof row.zodiac !== 'string' || !/^[鼠牛虎兔龍蛇馬羊猴雞狗豬]$/.test(row.zodiac)) throw new Error('Invalid lunar record or coverage');
  }
  return value as unknown as ChinesePack;
}

export function chineseLookup(date: string, pack: ChinesePack | null): CalendarResult {
  if (!civilParts(date)) return { status: 'unavailable', reason: 'invalid-date' };
  if (!pack) return { status: 'unavailable', reason: 'not-downloaded' };
  if (date < pack.start || date > pack.end) return { status: 'unavailable', reason: 'outside-range' };
  const record = pack.records.find(row=>row.date === date);
  return record ? { status: 'available', method: pack.method, version: pack.version, record } : { status: 'unavailable', reason: 'not-downloaded' };
}
