import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {lessons} from '../src/lessons.mjs';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
async function htmlFiles(dir){let all=[];for(const f of await readdir(dir,{withFileTypes:true})){const p=join(dir,f.name);if(f.isDirectory())all.push(...await htmlFiles(p));else if(f.name.endsWith('.html'))all.push(p);}return all;}
test('all static pages have unique metadata, semantics, and valid JSON-LD',async()=>{
 const titles=new Set(),descriptions=new Set(),canonicals=new Set();
 const files=await htmlFiles(root);assert.equal(files.length,9);
 for(const file of files){const s=await readFile(file,'utf8');
  for(const [pattern,set] of [[/<title>([^<]+)<\/title>/,titles],[/<meta name="description" content="([^"]+)"/,descriptions],[/<link rel="canonical" href="([^"]+)"/,canonicals]]){const match=s.match(pattern);assert.ok(match,file);assert.ok(!set.has(match[1]),'unique '+match[1]);set.add(match[1]);}
  assert.equal((s.match(/<h1[ >]/g)||[]).length,1);assert.match(s,/<html lang="en">/);assert.match(s,/<main id="main">/);
  assert.match(s,/name="twitter:card" content="summary_large_image"/);assert.match(s,/property="og:image"/);
  const schema=JSON.parse(s.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);assert.ok(['WebSite','LearningResource'].includes(schema['@type']));
  if(file.includes('lessons')&&!file.endsWith(join('lessons','index.html'))) assert.equal(schema['@type'],'LearningResource');
 }
});
test('every local static link, stylesheet, script, image and fragment resolves',async()=>{
 for(const file of await htmlFiles(root)){
  const html=await readFile(file,'utf8');const canonical=html.match(/rel="canonical" href="([^"]+)"/)[1];
  const site=new URL(canonical);const prefix=process.env.SITE_URL?new URL(process.env.SITE_URL).pathname.replace(/\/$/,''):'';
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   const u=new URL(match[1],canonical);if(u.origin!==site.origin)continue;
   let relative=decodeURIComponent(u.pathname);
   if(prefix && relative!==prefix && !relative.startsWith(prefix+'/'))continue; // Portfolio links are outside this project's root.
   if(prefix)relative=relative.slice(prefix.length);
   const dest=resolve(root,'.'+relative+(relative.endsWith('/')?'index.html':''));
   assert.ok(dest.startsWith(root),dest);assert.ok((await stat(dest)).isFile(),dest);
   if(u.hash){const text=await readFile(dest,'utf8');assert.ok(text.includes(`id="${u.hash.slice(1)}"`),u.href);}
  }
 }
});
test('sitemap, robots, card dimensions and performance budget',async()=>{
 const map=await readFile(join(root,'sitemap.xml'),'utf8');assert.equal((map.match(/<loc>/g)||[]).length,8);
 const robots=await readFile(join(root,'robots.txt'),'utf8');assert.match(robots,/Sitemap: https?:\/\//);
 if(!process.env.SITE_URL)assert.match(robots,/Disallow: \//);
 const png=await readFile(join(root,'assets/social.png'));assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
 let bytes=0;for(const name of ['index.html','assets/styles.css','assets/app.mjs','assets/physics.mjs'])bytes+=(await stat(join(root,name))).size;
 assert.ok(bytes<100000,`initial source payload ${bytes} bytes`);
});
test('five lesson quizzes have explanations and valid distinct choices',()=>{
 assert.equal(lessons.length,5);for(const l of lessons){assert.ok(l.steps.length>=3);assert.ok(l.correct>=0&&l.correct<l.options.length);assert.equal(new Set(l.options).size,3);assert.ok(l.feedback.length>40);}
});
