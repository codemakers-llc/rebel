#!/usr/bin/env node
/** CODEMAKERS REBEL: safe, small PROTO scaffolder. */
import {mkdir,cp,writeFile,readFile,stat,readdir,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const engine=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [command,arg1,arg2]=process.argv.slice(2);
const enginePkg=JSON.parse(await readFile(path.join(engine,'package.json'),'utf8'));
const exists=async file=>{try{await stat(file);return true}catch(e){if(e.code==='ENOENT')return false;throw e}};
const json=x=>JSON.stringify(x,null,2)+'\n';
const template = {
 'frontend/index.html':`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>REBEL App</title><link rel="stylesheet" href="/rebel.css"><link rel="stylesheet" href="/rebel-shell.css"><link rel="stylesheet" href="/app.css"></head><body><main class="rebel-starter"><h1 data-rebel-title>REBEL App</h1><div id="screen"></div></main><script type="module" src="/app.js"></script></body></html>`,
 'frontend/app.js':`import {createRebelApp,createConfigStore} from '/rebel/index.js';\nimport {createHeroLanding,createLoginModal} from '/rebel/app-shell.js';\nimport {createToast} from '/rebel/toast.js';\nconst toastRegion=document.createElement('div');toastRegion.id='oaactToastRegion';toastRegion.setAttribute('aria-live','polite');document.body.append(toastRegion);const toast=createToast();\nconst screen=document.querySelector('#screen');screen.textContent='Loading REBEL...';const response=await fetch('/api/bootstrap',{cache:'no-store'});if(!response.ok)throw Error('Bootstrap HTTP '+response.status);const store=createConfigStore();store.load(await response.json());const routes=Object.fromEntries(store.getViews().map(view=>[view.route,()=>import('/'+view.file+'?v='+encodeURIComponent(view.version||'1'))]));const app=createRebelApp({host:document.body,outlet:screen,routes});const login=createLoginModal({title:'Sign in',onError:message=>toast.show(message,'warning'),onSubmit:async()=>{throw Error('Connect your application authentication adapter to enable sign in.')}});document.body.append(login);const hero=createHeroLanding({title:'Build with REBEL',subtitle:'A lightweight frontend rendering engine shared by CODEMAKERS. Configure your views, components and backend freely.',onLogin:()=>login.showModal()});const explore=document.createElement('button');explore.type='button';explore.className='rebel-hero-login';explore.textContent='Explore sample';explore.style.marginLeft='10px';explore.addEventListener('click',()=>app.start());hero.append(explore);screen.replaceChildren(hero);\n`,
 'frontend/app.css':await readFile(path.join(engine,'starter/minimal.css'),'utf8'),
 'frontend/components/README.md':'# Client components\n\nPlace reusable project-specific JavaScript components here; REBEL Engine stays independent.\n',
 'frontend/features/home.js':`import {createGeneratedTableView} from '/rebel/generated-crud.js';\nexport default createGeneratedTableView({title:'My REBEL App',endpoint:'/api/records',fields:[{key:'id',label:'ID'},{key:'name',label:'Name'},{key:'status',label:'Status'}]});\n`,
 'scripts/data/runtime.json':json({records:[{id:1,name:'Sample record',status:'Active'}]}),
 '.env.example':'MODE=proto\nPORT=3100\n# dev and prod reserved; not implemented in PROTO starter\n',
 '.dockerignore':'node_modules\n.git\n.env\n*.log\n',
 'Dockerfile':`FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nCOPY vendor/ ./vendor/\nRUN npm install --omit=dev\nCOPY frontend/ ./frontend/\nCOPY scripts/ ./scripts/\nENV MODE=proto PORT=3100\nEXPOSE 3100\nCMD ["npm","start"]\n`,
 'scripts/server.js':`import http from 'node:http';import {readFile,writeFile,rename} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';\nconst base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.join(base,'frontend'),dataFile=path.join(base,'scripts/data/runtime.json');\nconst mode=(process.env.MODE||'proto').toLowerCase();if(mode!=='proto')throw Error('Only MODE=proto is implemented');\nconst send=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data))};\nconst server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname==='/api/bootstrap'&&req.method==='GET')return send(res,200,{version:1,role:null,views:[{route:'/',file:'features/home.js',name:'Home',version:'1'}],modules:[],menuItems:[],theme:{mode:'light',palette:'Minimal'}});if(url.pathname==='/api/records'){if(req.method==='GET'){const data=JSON.parse(await readFile(dataFile,'utf8'));return send(res,200,{items:data.records})}return send(res,405,{error:'Method not allowed'})}\nconst mapping={'/app.js':'frontend/app.js','/rebel.css':'node_modules/@code-makers/rebel/dist/codeview.css','/rebel-shell.css':'node_modules/@code-makers/rebel/dist/rebel-shell.css','/app.css':'frontend/app.css','/features/home.js':'frontend/features/home.js'};
const pathname=url.pathname;
let relativeFile=mapping[pathname];
if(pathname.startsWith('/rebel/')){
 const asset=pathname.slice('/rebel/'.length);
 // Preserve nested module paths: /rebel/components/index.js must map to dist/components/index.js.
 if(!new RegExp('^(?:[a-z][a-z0-9-]*/)*[a-z][a-z0-9-]*[.]js$').test(asset))return send(res,404,{error:'Asset not found'});
 relativeFile='node_modules/@code-makers/rebel/dist/'+asset;
}
if(!relativeFile&&pathname!=='/'&&pathname!=='/index.html')return send(res,404,{error:'Route not found'});
const file=path.join(base,relativeFile||'frontend/index.html');
const body=await readFile(file);
res.setHeader('Content-Type',file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.js')?'text/javascript; charset=utf-8':'text/html; charset=utf-8');
res.setHeader('Cache-Control','no-store');
res.end(body)}catch(e){send(res,404,{error:'Asset not found'})}});
const port=Number(process.env.PORT||3100);
server.listen(port,()=>{console.log('CODEMAKERS REBEL · Starter');console.log('Local: http://localhost:'+port);console.log('Listening (HTTP server bound)')});\n`
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
 await writeFile(path.join(dest,'scripts/README.md'),'# REBEL Starter\n\nRun `npm install` and `npm start`.\nAll data is stored in `scripts/data/runtime.json`; only MODE=proto is implemented.\n');
 console.log('Initialized REBEL NEW at '+dest+'\nNext: npm install && npm start');
}
// Genesis is a separate application hosted in GitHub. Nothing from Genesis is bundled
// in the npm Engine: the CLI fetches it on demand and installs the Engine from npm.

async function newEnterpriseStarter(dest,{localPath=null,repository=null}={}){
 const workspace=repository?await mkdtemp(path.join(tmpdir(),'rebel-init-new-')):null;
 try{
 if(repository){
  if(!/^https:\/\/github\.com\/codemakers-llc\/[a-zA-Z0-9._-]+(?:\.git)?$/.test(repository))throw Error('Only HTTPS repositories from codemakers-llc on GitHub are allowed');
  run('git',['clone','--depth','1',repository,path.join(workspace,'starter')]);
 }
 const source=repository?path.join(workspace,'starter'):localPath?path.resolve(dest,localPath):path.join(engine,'templates/init-new');
 if(!await exists(path.join(source,'package.json'))||!await exists(path.join(source,'frontend/app.js')))throw Error('REBEL INIT NEW template not found; provide --local PATH');
 const existing=await readdir(dest);const allowed=new Set(['package.json','package-lock.json','node_modules']);
 const conflicts=existing.filter(name=>!allowed.has(name));if(conflicts.length)throw Error('INIT NEW requires empty destination (except npm metadata): '+conflicts.join(', '));
 for(const name of await readdir(source)){
  if(['node_modules','.git','package-lock.json','vendor'].includes(name))continue;
  if(name==='package.json')continue;
  await cp(path.join(source,name),path.join(dest,name),{recursive:true,errorOnExist:true,force:false});
 }
 const original=JSON.parse(await readFile(path.join(source,'package.json'),'utf8'));
 const existingPkg=await exists(path.join(dest,'package.json'))?JSON.parse(await readFile(path.join(dest,'package.json'),'utf8')):{};
 const existingSpec=existingPkg.dependencies?.['@code-makers/rebel']||existingPkg.devDependencies?.['@code-makers/rebel'];
 const merged={...original,name:existingPkg.name||path.basename(dest),private:true,dependencies:{...original.dependencies,'@code-makers/rebel':existingSpec||enginePkg.version}};
 await writeFile(path.join(dest,'package.json'),json(merged));await rm(path.join(dest,'package-lock.json'),{force:true});
 console.log('Initialized REBEL Enterprise Starter at '+dest);
 console.log('Next: npm install && npm test && npm start');
 }finally{if(workspace)await rm(workspace,{recursive:true,force:true,maxRetries:3,retryDelay:50})}
}

const GENESIS_REPOSITORY='https://github.com/codemakers-llc/rebel-genesis.git';
const GENESIS_REF='main'; // Use --ref <tag> when verified Genesis release tags exist.
function run(command,args,options={}){
 try{return execFileSync(command,args,{stdio:'inherit',...options})}
 catch(error){throw Error(`${command} ${args.slice(0,3).join(' ')} failed (exit ${error.status??'unknown'}).`)}
}
async function genesis(dest,{ref=GENESIS_REF,localPath=null}={}){
 if(!/^[a-zA-Z0-9][a-zA-Z0-9._\/-]{0,127}$/.test(ref)||ref.includes('..')||ref.startsWith('/')||ref.includes('\\')){
  throw Error('Invalid Genesis ref');
 }
 const existing=await readdir(dest);
 const allowed=new Set(['package.json','package-lock.json','node_modules']);
 const conflicts=existing.filter(name=>!allowed.has(name));
 if(conflicts.length)throw Error('Genesis requires an empty project folder (except package.json, package-lock.json and node_modules). Existing: '+conflicts.join(', '));
 const workspace=await mkdtemp(path.join(tmpdir(),'rebel-genesis-'));
 try{
  const templateDir=path.join(workspace,'genesis');
  if(localPath){
   const source=path.resolve(dest,localPath);
   if(!await exists(path.join(source,'package.json'))||!await exists(path.join(source,'frontend/index.html')))throw Error('Local Genesis template must contain package.json and frontend/index.html');
   console.log('Loading local CODEMAKERS REBEL Genesis template...');
   await cp(source,templateDir,{recursive:true,filter:src=>!['node_modules','.git','vendor'].includes(path.basename(src))});
  }else{
   // REBEL_GENESIS_REPO is for local, offline CLI integration testing.
   const repository=process.env.REBEL_GENESIS_REPO||GENESIS_REPOSITORY;
   console.log(`Downloading CODEMAKERS REBEL Genesis (${ref})...`);
   run('git',['clone','--depth','1','--branch',ref,repository,templateDir]);
  }
  const names=await readdir(templateDir);
  for(const name of names){
   if(['.git','node_modules','vendor','comands.txt'].includes(name))continue;
   if(name==='package.json'||name==='package-lock.json')continue;
   if(await exists(path.join(dest,name)))throw Error('Cannot replace existing project file: '+name);
  }
  // Copy the application, never the cloned repo history or a vendored Engine.
  for(const name of names){
   if(['.git','node_modules','vendor','comands.txt','package-lock.json'].includes(name))continue;
   if(name==='package.json')continue;
   await cp(path.join(templateDir,name),path.join(dest,name),{recursive:true,errorOnExist:true,force:false});
  }
  const pkg=JSON.parse(await readFile(path.join(templateDir,'package.json'),'utf8'));
  pkg.dependencies={...pkg.dependencies,'@code-makers/rebel':enginePkg.version};
  if(localPath){
   const installed=JSON.parse(await readFile(path.join(dest,'package.json'),'utf8'));
   const spec=installed.dependencies?.['@code-makers/rebel']||installed.devDependencies?.['@code-makers/rebel'];
   if(spec)pkg.dependencies['@code-makers/rebel']=spec;
  }
  pkg.type='module';
  pkg.scripts={...pkg.scripts,start:pkg.scripts?.start||'node scripts/server.js'};
  await writeFile(path.join(dest,'package.json'),json(pkg));
  // Use a fresh lockfile for the Engine version shipped with this CLI.
  // Any old lockfile is invalid after changing dependency versions.
  await rm(path.join(dest,'package-lock.json'),{force:true});
  const seed=path.join(dest,'scripts/data/runtime.seed.json');
  const runtime=path.join(dest,'scripts/data/runtime.json');
  if(!await exists(runtime)&&await exists(seed))await cp(seed,runtime);
  const gitignore=path.join(dest,'.gitignore');
  if(await exists(gitignore)){
   let ignore=await readFile(gitignore,'utf8');
   for(const rule of ['node_modules/','vendor/','scripts/data/runtime.json','comands.txt']){
    if(!ignore.split(/\r?\n/).includes(rule))ignore+='\n'+rule;
   }
   await writeFile(gitignore,ignore.trimEnd()+'\n');
  }
  if(process.env.REBEL_SKIP_INSTALL!=='1'){
   console.log('Installing npm dependencies...');
   run(process.platform==='win32'?'npm.cmd':'npm',['install','--no-audit','--no-fund'],{cwd:dest});
  }
  console.log('Initialized CODEMAKERS REBEL Genesis at '+dest+'\nNext: npm start\nLocal: http://localhost:3100');
 }finally{await rm(workspace,{recursive:true,force:true,maxRetries:3,retryDelay:50})}
}
const usage=`Usage:
  rebel init new             Create frontend Enterprise Starter (bundled template)
  rebel init new --local PATH Test a local GitHub-ready init-new repository
  rebel init new --repo URL   Clone a published CODEMAKERS init-new repository
  rebel init blank           Alias for init new
  rebel init proto           Download Genesis from CODEMAKERS GitHub, install dependencies
  rebel init proto --ref TAG Download a specific published Genesis Git tag
  rebel init proto --local PATH Use a local Genesis ZIP extraction
  rebel --version            Show installed REBEL version
  rebel --help               Show this help`;
try{
 if(['--version','-v','version'].includes(command)){console.log(enginePkg.version)}
 else if(['--help','-h','help'].includes(command)||!command){console.log(usage)}
 else if(command==='init'&&arg1==='new'&&(!arg2||['--local','--repo'].includes(arg2))&&process.argv.length<=6){if(arg2&&!process.argv[5])throw Error('Missing template path or repository');await newEnterpriseStarter(process.cwd(),{localPath:arg2==='--local'?process.argv[5]:null,repository:arg2==='--repo'?process.argv[5]:null})}
 else if(command==='init'&&arg1==='blank'&&!arg2){await scaffold(process.cwd(),{installed:true})}
 else if(command==='init'&&arg1==='proto'&&(!arg2||['--ref','--local'].includes(arg2))&&process.argv.length<=6){
  if(arg2&&!process.argv[5])throw Error('Missing value after '+arg2);
  await genesis(process.cwd(),{ref:arg2==='--ref'?process.argv[5]:GENESIS_REF,localPath:arg2==='--local'?process.argv[5]:null});
 }
 else {console.error(usage);process.exitCode=1}
}catch(error){console.error('REBEL CLI: '+error.message);process.exitCode=1}
