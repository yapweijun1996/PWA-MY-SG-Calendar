import { describe, expect, test } from 'vitest';
import { addDays, addMonths, civilParts, monthDays, regionalToday } from './civil-date';

describe('civil dates',()=>{
  test.each(['2026-02-29','2026-04-31','2026-1-01','0000-01-01','not-a-date','2026-11-12T00:00:00Z'])('rejects %s',date=>expect(civilParts(date)).toBeNull());
  test('leap days and arithmetic do not parse local midnight',()=>{
    expect(addDays('2024-02-28',1)).toBe('2024-02-29');
    expect(addDays('2024-02-29',1)).toBe('2024-03-01');
    expect(addDays('2026-12-31',1)).toBe('2027-01-01');
    expect(addDays('0099-12-31',1)).toBe('0100-01-01');
    expect(addMonths('2026-01-31',1)).toBe('2026-02-28');
    expect(addMonths('2024-02-29',12)).toBe('2025-02-28');
  });
  test('regional midnight is injected rather than using the device day',()=>{
    expect(regionalToday(()=>new Date('2026-11-11T15:59:59Z'),'MY')).toBe('2026-11-11');
    expect(regionalToday(()=>new Date('2026-11-11T16:00:00Z'),'SG')).toBe('2026-11-12');
  });
  test('grid starts on the configured weekday and includes adjacent civil days',()=>{
    expect(monthDays('2026-02-17',1)).toHaveLength(42);
    expect(monthDays('2026-02-17',1)[0]).toBe('2026-01-26');
    expect(monthDays('2026-02-17',0)[0]).toBe('2026-02-01');
  });
});
