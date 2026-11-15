import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,cp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn,execFileSync} from 'node:child_process';
import net from 'node:net';

const engine=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
async function freePort(){return new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',reject);s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port))})})}
async function waitFor(url){for(let i=0;i<80;i++){try{return await fetch(url)}catch{await new Promise(resolve=>setTimeout(resolve,40))}}throw Error('Starter did not start')}

test('CLI starter serves bounded, correct ESM assets and announces branding and port',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'rebel-starter-'));
 let server;
 try{
  await writeFile(path.join(dir,'package.json'),JSON.stringify({name:'test-proto',version:'1.0.0',dependencies:{'@code-makers/rebel':'file:../rebel'}}));
  const installed=path.join(dir,'node_modules/@code-makers/rebel');
  await mkdir(installed,{recursive:true});
  await cp(path.join(engine,'dist'),path.join(installed,'dist'),{recursive:true});
  await writeFile(path.join(installed,'package.json'),JSON.stringify({name:'@code-makers/rebel',type:'module',exports:{'.':'./dist/index.js'}}));
  execFileSync(process.execPath,[path.join(engine,'bin/rebel.js'),'init','new'],{cwd:dir,stdio:'pipe'});
  const source=await readFile(path.join(dir,'scripts/server.js'),'utf8');
  assert.match(source,/CODEMAKERS REBEL/);
  assert.match(source,/ENGINE_DIST/);
  const port=await freePort();
  let output='';
  server=spawn(process.execPath,[path.join(dir,'scripts/server.js')],{cwd:dir,env:{...process.env,HOST:'ignored-for-test',PORT:String(port)}});
  server.stdout.on('data',chunk=>{output+=chunk});
  server.stderr.on('data',chunk=>{output+=chunk});
  assert.equal((await waitFor(`http://127.0.0.1:${port}/api/bootstrap`)).status,200);
  const requests=['/','/app.js','/rebel/index.js','/rebel/components/index.js','/rebel/components/not-found.js','/features/dashboard.js','/api/dashboard','/favicon.ico'];
  const responses=await Promise.all(requests.map(async endpoint=>({endpoint,response:await fetch(`http://127.0.0.1:${port}${endpoint}`)})));
  const get=key=>responses.find(x=>x.endpoint===key).response;
  assert.equal(get('/rebel/components/index.js').status,200);
  assert.match(await get('/rebel/components/index.js').text(),/createKpiWidget/);
  assert.match(await get('/rebel/index.js').text(),/createRebelApp/);
  assert.equal(get('/rebel/components/not-found.js').status,404);
  assert.equal(get('/favicon.ico').status,200);
  assert.match(get('/favicon.ico').headers.get('content-type'),/image\/x-icon/);
  const dashboard=await get('/api/dashboard').json();assert.ok(dashboard&&typeof dashboard==='object');
  await new Promise(resolve=>setTimeout(resolve,25));
  assert.match(output,/CODEMAKERS REBEL/);
  assert.match(output,new RegExp('Local: http://localhost:'+port));
  const example=await readFile(path.join(dir,'.env.example'),'utf8');
  assert.match(example,/PORT=3100/);
  assert.doesNotMatch(example,/^HOST=/m);
  assert.match(source,/createServer\(\)\.listen\(PORT,/);
  assert.doesNotMatch(source,/process\.env\.HOST/);
  assert.match(source,/scripts\/data\/runtime.json/);
 }finally{server?.kill();await rm(dir,{recursive:true,force:true,maxRetries:8,retryDelay:100})}
});
