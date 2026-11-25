// Run after npm start. A separate HTTP check so ordinary unit tests need no open port.
import assert from 'node:assert/strict';
const base=process.env.DEMO_URL||'http://127.0.0.1:4173';
for(const route of ['/','/lessons/','/lessons/gravity/','/lessons/circular-orbits/','/lessons/elliptical-orbits/','/lessons/keplers-laws/','/lessons/orbital-elements/','/about/','/assets/app.mjs','/assets/physics.mjs','/assets/styles.css','/assets/social.png','/sitemap.xml','/robots.txt']){
 const r=await fetch(base+route);assert.equal(r.status,200,route);assert.ok((await r.arrayBuffer()).byteLength>0);console.log('PASS 200 '+route);
}
const redirect=await fetch(base+'/lessons/gravity',{redirect:'manual'});assert.equal(redirect.status,301);assert.ok(redirect.headers.get('location').endsWith('/lessons/gravity/'));console.log('PASS directory redirect');
const missing=await fetch(base+'/does-not-exist/');assert.equal(missing.status,404);assert.match(await missing.text(),/This orbit leads nowhere/);console.log('PASS unknown path returns 404');
const script=await fetch(base+'/assets/app.mjs');assert.match(script.headers.get('content-type'),/javascript/);console.log('PASS module content type');
console.log('17 HTTP checks passed.');
