#!/usr/bin/env node
/** CODEMAKERS REBEL: safe, small PROTO scaffolder. */
import {mkdir,cp,writeFile,readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const engine=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [command,arg1,arg2]=process.argv.slice(2);
const enginePkg=JSON.parse(await readFile(path.join(engine,'package.json'),'utf8'));
const exists=async file=>{try{await stat(file);return true}catch(e){if(e.code==='ENOENT')return false;throw e}};
const json=x=>JSON.stringify(x,null,2)+'\n';
const template = {
 'frontend/index.html':`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>REBEL PROTO</title><link rel="stylesheet" href="/rebel.css"></head><body><main style="padding:24px;max-width:1100px;margin:auto"><h1 data-rebel-title>REBEL Prototype</h1><div id="screen"></div></main><script type="module" src="/app.js"></script></body></html>`,
 'frontend/app.js':`import {createRebelApp,createConfigStore} from '/rebel/index.js';\nconst response=await fetch('/api/bootstrap',{cache:'no-store'});if(!response.ok)throw Error('Bootstrap HTTP '+response.status);const store=createConfigStore();store.load(await response.json());const routes=Object.fromEntries(store.getViews().map(view=>[view.route,()=>import('/'+view.file+'?v='+encodeURIComponent(view.version||'1'))]));const app=createRebelApp({host:document.body,outlet:document.querySelector('#screen'),routes});app.start();\n`,
 'frontend/components/README.md':'# Client components\n\nPlace reusable project-specific JavaScript components here; REBEL Engine stays independent.\n',
 'frontend/features/home.js':`import {createGeneratedTableView} from '/rebel/generated-crud.js';\nexport default createGeneratedTableView({title:'My REBEL Prototype',endpoint:'/api/records',fields:[{key:'id',label:'ID'},{key:'name',label:'Name'},{key:'status',label:'Status'}]});\n`,
 'scripts/data/runtime.json':json({records:[{id:1,name:'Sample record',status:'Active'}]}),
 '.env.example':'MODE=proto\nPORT=3100\nHOST=127.0.0.1\n# dev and prod reserved; not implemented in PROTO starter\n',
 '.dockerignore':'node_modules\n.git\n.env\n*.log\n',
 'Dockerfile':`FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nCOPY vendor/ ./vendor/\nRUN npm install --omit=dev\nCOPY frontend/ ./frontend/\nCOPY scripts/ ./scripts/\nENV MODE=proto HOST=0.0.0.0 PORT=3100\nEXPOSE 3100\nCMD ["npm","start"]\n`,
 'scripts/server.js':`import http from 'node:http';import {readFile,writeFile,rename} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';\nconst base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.join(base,'frontend'),dataFile=path.join(base,'scripts/data/runtime.json');\nconst mode=(process.env.MODE||'proto').toLowerCase();if(mode!=='proto')throw Error('Only MODE=proto is implemented');\nconst send=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data))};\nhttp.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname==='/api/bootstrap'&&req.method==='GET')return send(res,200,{version:1,role:null,views:[{route:'/',file:'features/home.js',name:'Home',version:'1'}],modules:[],menuItems:[],theme:{mode:'light',palette:'Minimal'}});if(url.pathname==='/api/records'){if(req.method==='GET'){const data=JSON.parse(await readFile(dataFile,'utf8'));return send(res,200,{items:data.records})}return send(res,405,{error:'Method not allowed'})}\nconst mapping={'/app.js':'frontend/app.js','/rebel.css':'node_modules/@code-makers/rebel/dist/codeview.css','/features/home.js':'frontend/features/home.js'};const pref='/rebel/';const file=url.pathname.startsWith(pref)&&/^[a-z][a-z0-9-]*\.js$/.test(path.basename(url.pathname))?path.join(base,'node_modules/@code-makers/rebel/dist',path.basename(url.pathname)):path.join(base,mapping[url.pathname]||'frontend/index.html');const body=await readFile(file);res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html');res.end(body)}catch(e){res.writeHead(404);res.end('Not found')}}).listen(Number(process.env.PORT||3100),process.env.HOST||'127.0.0.1');\n`
};
async function scaffold(dest,{installed}){
 const conflicts=[];for(const file of Object.keys(template)){if(await exists(path.join(dest,file)))conflicts.push(file)}
 if(conflicts.length){console.error('Cannot initialize: files already exist:\n'+conflicts.join('\n'));process.exit(1)}
 if(installed){
  const p=path.join(dest,'package.json');if(!await exists(p)){console.error('First create package.json and install @code-makers/rebel');process.exit(1)}
  const pkg=JSON.parse(await readFile(p,'utf8'));
  if(!(pkg.dependencies?.['@code-makers/rebel']||pkg.devDependencies?.['@code-makers/rebel'])){console.error('Install @code-makers/rebel before running init');process.exit(1)}
  pkg.type='module';pkg.scripts={...pkg.scripts,start:pkg.scripts?.start||'node scripts/server.js'};
  await writeFile(p,json(pkg));
 }else{
  await mkdir(path.join(dest,'vendor/rebel'),{recursive:true});
  for(const item of ['dist','LICENSE','AUTHORS.md','README.md'])await cp(path.join(engine,item),path.join(dest,'vendor/rebel',item),{recursive:true});
  await writeFile(path.join(dest,'vendor/rebel/package.json'),json({name:'@code-makers/rebel',version:enginePkg.version,type:'module',exports:{'.':'./dist/index.js'}}));
  await writeFile(path.join(dest,'package.json'),json({name:path.basename(dest),version:'0.0.1',private:true,type:'module',scripts:{start:'node scripts/server.js'},dependencies:{'@code-makers/rebel':'file:./vendor/rebel'}}));
 }
 for(const [file,data] of Object.entries(template)){const target=path.join(dest,file);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,data,{flag:'wx'})}
 // For init, existing package can point to registry or vendored package; no vendor folder is needed for node mode.
 if(installed){const docker=path.join(dest,'Dockerfile');let data=await readFile(docker,'utf8');data=data.replace('COPY vendor/ ./vendor/\n','');await writeFile(docker,data)}
 await writeFile(path.join(dest,'scripts/README.md'),'# REBEL PROTO\n\nRun `npm install` and `npm start`.\nAll data is stored in `scripts/data/runtime.json`; only MODE=proto is implemented.\n');
 console.log('Initialized REBEL PROTO at '+dest+'\nNext: npm install && npm start');
}
if(command==='init'&&(!arg1||arg1==='proto')&&!arg2){await scaffold(process.cwd(),{installed:true})}
else if(command==='create'&&arg1==='proto'&&arg2&&/^[a-z][a-z0-9_-]*$/.test(arg2)){
 const dest=path.resolve(process.cwd(),arg2);if(await exists(dest)){console.error('Destination already exists: '+dest);process.exit(1)}
 await mkdir(dest,{recursive:true});await scaffold(dest,{installed:false});
}else{console.error('Usage:\n  rebel init [proto]   (inside a project with REBEL installed)\n  rebel create proto my-prototype');process.exit(1)}
