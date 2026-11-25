import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const port=Number(process.env.PORT||4173);
const base=(process.env.BASE_PATH||'').replace(/\/$/,'');
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.xml':'application/xml','.txt':'text/plain'};
http.createServer(async(req,res)=>{
 try{
  let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(base){if(name!==base&&!name.startsWith(base+'/')) throw new Error('Not found');name=name.slice(base.length)||'/';}
  let target=path.resolve(root,'.'+name);
  if(target!==root&&!target.startsWith(root+path.sep)) throw new Error('Not found');
  if((await stat(target)).isDirectory()) {if(!name.endsWith('/')) {res.writeHead(301,{Location:(base+name+'/')});res.end();return;}target=path.join(target,'index.html');}
  const data=await readFile(target);
  res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(data);
 }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(path.join(root,'404.html')).catch(()=>'<h1>Build OrbitLab first: npm run build</h1>'));}
}).listen(port,'127.0.0.1',()=>console.log(`OrbitLab local demo: http://127.0.0.1:${port}${base}/`));
