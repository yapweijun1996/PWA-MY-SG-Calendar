import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { marked } from 'marked';

// Explicit publication allowlist: never copy the repository or private agent notes.
const docs = [
  ['PRD', '产品需求', '目标、首版范围与后续能力'],
  ['DATA-SOURCES', '农历数据方案', '2026–2027 来源、方法与验证范围'],
  ['ARCHITECTURE', '架构设计', '模块边界、状态与恢复策略'],
  ['DATA-CONTRACT', '数据规范', '日期、节日和官方假期的区别'],
  ['UI-STANDARD', '界面与体验', '交互、无障碍与 PWA 目标'],
  ['TESTING', '测试与验收', '验证标准与尚未执行的检查'],
  ['DEVELOPMENT', '开发路线图', '编码约定与阶段计划'],
  ['DEPLOYMENT', '网站发布', 'GitHub Actions、Pages 与恢复流程'],
];
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const publicFiles = new Set(docs.map(([id]) => `${id}.md`));
const renderer = new marked.Renderer();
renderer.html = ({ text }) => escape(text);
renderer.link = function ({ href, text: label, tokens }) {
  let target = href;
  if (/^[A-Z-]+\.md(?:#.*)?$/.test(href)) {
    const [file, fragment] = href.split('#');
    if (!publicFiles.has(file)) return escape(label);
    target = file.replace(/\.md$/, '.html') + (fragment ? `#${fragment}` : '');
  }
  if (!/^(https?:\/\/|[A-Z-]+\.html(?:#.*)?$|#)/.test(target)) return escape(label);
  return `<a href="${escape(target)}">${tokens ? this.parser.parseInline(tokens) : escape(label)}</a>`;
};
marked.use({ renderer });
const buildId = process.env.GITHUB_SHA ?? execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
await mkdir('dist/docs', { recursive: true });
await copyFile('site/styles.css', 'dist/styles.css');
await writeFile('dist/.nojekyll', '');
const cards = docs.map(([id, title, description], i) => `<a class="doc-card" href="./docs/${id}.html"><div><span class="number">${String(i + 1).padStart(2, '0')}</span><h3>${title}</h3><p>${description}</p></div><span aria-hidden="true">↗</span></a>`).join('\n');
const home = (await readFile('site/index.html', 'utf8')).replace('<!-- DOCUMENT_CARDS -->', cards).replace('<!-- BUILD_ID -->', escape(buildId.slice(0, 12)));
await writeFile('dist/index.html', home);
for (const [id] of docs) {
  const source = await readFile(`docs/${id}.md`, 'utf8');
  const title = source.match(/^# (.+)$/m)?.[1] ?? id;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)} · MY/SG Calendar</title><link rel="stylesheet" href="../styles.css"></head><body><a class="skip" href="#main">Skip to content</a><header class="topbar"><a class="brand" href="../">MY / SG <span>CALENDAR</span></a><a href="../#documents">All documents</a></header><main id="main" class="doc-main"><a class="breadcrumb" href="../#documents">← Project documents</a><p class="doc-notice">Planning documentation · The calendar application is not yet available.</p><article>${marked.parse(source)}</article></main><footer><a href="../">Project home</a><span>Build ${escape(buildId.slice(0, 12))}</span></footer></body></html>`;
  await writeFile(`dist/docs/${id}.html`, html);
}
await writeFile('dist/build.json', JSON.stringify({ commit: buildId, kind: 'documentation-preview', documents: docs.map(([id]) => id) }, null, 2) + '\n');
console.log(`Built documentation preview: ${docs.length} documents, commit ${buildId.slice(0, 12)}`);
