import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { normalizeHko } from './hko-normalize.mjs';

const directory = new URL('../data/raw/hko/', import.meta.url);
const sources = JSON.parse(await readFile(new URL('sources.json', directory), 'utf8'));
const records = [];
for (const source of sources) {
  const bytes = await readFile(new URL(source.file, directory));
  if (createHash('sha256').update(bytes).digest('hex') !== source.sha256) throw new Error(`Source hash mismatch: ${source.id}`);
  records.push(...normalizeHko(bytes.toString('utf8'), source.year));
}
const digest = createHash('sha256').update(JSON.stringify({normalization:'hko-v1',verifiedAt:'2026-11-12',sources,records})).digest('hex');
const pack = { schemaVersion: 1, kind: 'chinese-calendar', method: 'hko-table',
  version: `hko-2026-2027-${digest.slice(0, 12)}`, start: '2026-01-01', end: '2027-12-31',
  verifiedAt: '2026-11-12', sources, records };
const output = new URL('../app/public/data/', import.meta.url);
await mkdir(output, { recursive: true });
const json = JSON.stringify(pack) + '\n';
await writeFile(new URL('chinese-2026-2027.json', output), json);
await writeFile(new URL('manifest.json', output), JSON.stringify({schemaVersion: 1, packs: [{file: 'chinese-2026-2027.json', version: pack.version, sha256: createHash('sha256').update(json).digest('hex')}]}, null, 2) + '\n');
console.log(`Generated ${pack.version}: ${records.length} dates from pinned sources.`);
