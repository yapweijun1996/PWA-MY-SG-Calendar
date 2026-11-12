import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve('dist');
const entries = ['index.html', ...(await readdir('dist/docs')).map((file) => `docs/${file}`)];
let links = 0;
for (const entry of entries) {
  const html = await readFile(path.join(root, entry), 'utf8');
  assert.match(html, /<html lang="(?:en|zh-Hans)">/, `${entry}: language missing`);
  assert.match(html, /name="viewport"/, `${entry}: viewport missing`);
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1, `${entry}: expected one h1`);
  assert(!/<!-- (DOCUMENT_CARDS|BUILD_ID) -->/.test(html), `${entry}: unreplaced template`);
  for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^https?:/.test(href)) continue;
    const [file, fragment] = href.split('#');
    let resolved = file ? path.resolve(root, path.dirname(entry), file) : path.join(root, entry);
    assert(resolved === root || resolved.startsWith(root + path.sep), `Outside output: ${href}`);
    if ((await stat(resolved)).isDirectory()) resolved = path.join(resolved, 'index.html');
    const content = await readFile(resolved, 'utf8');
    if (fragment) assert(content.includes(`id="${fragment}"`), `Missing fragment: ${entry} -> ${href}`);
    links++;
  }
}
const build = JSON.parse(await readFile('dist/build.json', 'utf8'));
assert.equal(build.kind, 'documentation-preview');
assert.equal(build.documents.length, 8);
assert.match(build.commit, /^[a-f0-9]{40}$/);
const top = await readdir('dist');
assert.deepEqual(top.sort(), ['.nojekyll', 'build.json', 'docs', 'index.html', 'styles.css'].sort());
assert.equal(entries.length, 9);
console.log(`PASS: ${entries.length} pages, ${links} local links, build identity and publication allowlist`);
