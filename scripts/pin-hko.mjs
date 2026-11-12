import { createHash } from 'node:crypto';
import { mkdir, writeFile, access } from 'node:fs/promises';

const directory = new URL('../data/raw/hko/', import.meta.url);
await mkdir(directory, { recursive: true });
const register = new URL('sources.json', directory);
try {
  await access(register);
  throw new Error('Pinned sources already exist. Review a new source release separately.');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const sources = [];
for (const year of [2026, 2027]) {
  const url = `https://data.weather.gov.hk/weatherAPI/hko_data/calendar/nongli_calendar_${year}.csv`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Source ${year}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const retrievedAt = new Date().toISOString();
  await writeFile(new URL(`${year}.csv`, directory), bytes, { flag: 'wx' });
  sources.push({ id: `hko-${year}`, year, file: `${year}.csv`, url,
    sha256: createHash('sha256').update(bytes).digest('hex'), retrievedAt,
    terms: 'https://data.gov.hk/en/terms-and-conditions',
    attribution: 'Source: Hong Kong Observatory, Government of the Hong Kong Special Administrative Region; DATA.GOV.HK.' });
}
await writeFile(register, JSON.stringify(sources, null, 2) + '\n', { flag: 'wx' });
console.log('Pinned HKO 2026/2027 source files and SHA-256 register.');
