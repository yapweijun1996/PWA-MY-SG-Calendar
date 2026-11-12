import {readFile,writeFile,readdir} from 'node:fs/promises';
const lock=JSON.parse(await readFile('package-lock.json','utf8'));
const inventory=Object.entries(lock.packages).filter(([path])=>path).map(([path,p])=>({name:p.name??path.slice(path.lastIndexOf('node_modules/')+13),version:p.version,license:p.license??'SEE PACKAGE NOTICE',development:Boolean(p.dev)})).sort((a,b)=>a.name.localeCompare(b.name)||a.version.localeCompare(b.version));
await writeFile('data/dependency-licenses.json',JSON.stringify(inventory,null,2)+'\n');
let notices='Third-party notices for the calendar browser bundles\nGenerated from the installed lockfile; do not edit.\n\n';
for(const name of ['react','react-dom','scheduler',...(await readdir('node_modules')).filter(name=>name.startsWith('workbox-'))]){
  const manifest=JSON.parse(await readFile(`node_modules/${name}/package.json`,'utf8'));
  const license=(await readdir(`node_modules/${name}`)).find(file=>/^license(?:\.|$)/i.test(file));
  if(!license)throw new Error(`Missing license text: ${name}`);
  notices+=`=== ${name} ${manifest.version} (${manifest.license}) ===\n\n${await readFile(`node_modules/${name}/${license}`,'utf8')}\n\n`;
}
await writeFile('app/public/THIRD-PARTY-NOTICES.txt',notices);
await writeFile('app/public/LICENSE.txt',await readFile('LICENSE'));
console.log(`Recorded ${inventory.length} locked dependency licenses and browser notices.`);
