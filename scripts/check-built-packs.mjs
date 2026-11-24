import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';

const built = new URL('../dist-app/data/', import.meta.url);
const source = new URL('../app/public/data/', import.meta.url);
const files = (await readdir(source)).filter(name => name.endsWith('.json') && name !== 'manifest.json').sort();
const manifest = JSON.parse(await readFile(new URL('manifest.json', built), 'utf8'));
assert.equal(manifest.schemaVersion, 1, 'Unsupported built data manifest');
assert.ok(files.length > 0, 'No calendar packs found');
assert.deepEqual(manifest.packs.map(pack => pack.file).sort(), files, 'Built manifest must list each calendar pack once');

for (const { file, sha256, version } of manifest.packs) {
  const bytes = await readFile(new URL(file, built));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), sha256, `Built pack checksum mismatch: ${file}`);
  assert.equal(JSON.parse(bytes).version, version, `Built pack version mismatch: ${file}`);
}
console.log(`Verified ${files.length} built calendar packs against dist-app/data/manifest.json`);
