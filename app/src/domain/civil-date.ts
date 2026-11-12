export interface CivilParts { year: number; month: number; day: number }

export function civilParts(value: string): CivilParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1) return null;
  const instant = utcDate(year, month, day);
  return instant.getUTCFullYear() === year && instant.getUTCMonth() === month - 1 && instant.getUTCDate() === day ? { year, month, day } : null;
}

function utcDate(year: number, month: number, day: number): Date {
  const result = new Date(0);
  result.setUTCFullYear(year, month - 1, day);
  return result;
}

export function civilInstant(value: string): Date {
  const parts = civilParts(value);
  if (!parts) throw new RangeError(`Invalid civil date: ${value}`);
  return utcDate(parts.year, parts.month, parts.day);
}

export function formatCivil(year: number, month: number, day: number): string {
  const value = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  if (!civilParts(value)) throw new RangeError('Civil date outside supported range 0001-9999');
  return value;
}

export function addDays(value: string, days: number): string {
  if (!Number.isInteger(days)) throw new RangeError('Expected an integer day offset');
  const date = civilInstant(value);
  date.setUTCDate(date.getUTCDate() + days);
  return formatCivil(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function addMonths(value: string, months: number): string {
  if (!Number.isInteger(months)) throw new RangeError('Expected an integer month offset');
  const parts = civilParts(value);
  if (!parts) throw new RangeError('Invalid civil date');
  const first = utcDate(parts.year, parts.month + months, 1);
  const last = utcDate(first.getUTCFullYear(), first.getUTCMonth() + 2, 0);
  return formatCivil(first.getUTCFullYear(), first.getUTCMonth() + 1, Math.min(parts.day, last.getUTCDate()));
}

export function weekday(value: string): number { return civilInstant(value).getUTCDay(); }

export function monthDays(value: string, weekStart: 0 | 1): string[] {
  const first = value.slice(0, 7) + '-01';
  const start = addDays(first, -((weekday(first) - weekStart + 7) % 7));
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function regionalToday(clock: () => Date = () => new Date(), region: 'MY' | 'SG' = 'SG'): string {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone: region === 'MY' ? 'Asia/Kuala_Lumpur' : 'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(clock());
  return `${parts.find(p=>p.type==='year')?.value}-${parts.find(p=>p.type==='month')?.value}-${parts.find(p=>p.type==='day')?.value}`;
}
