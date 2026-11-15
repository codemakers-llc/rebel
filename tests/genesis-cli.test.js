import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const engine=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cli=path.join(engine,'bin/rebel.js');
const available=()=>{try{execFileSync('git',['--version'],{stdio:'ignore'});return true}catch{return false}};
const exists=async file=>{try{await stat(file);return true}catch{return false}};

test('init proto fetches separate Genesis Git source without vendor or git history', {skip:!available()}, async()=>{
 const base=await mkdtemp(path.join(tmpdir(),'rebel-genesis-cli-'));
 try{
  const repo=path.join(base,'source');const dest=path.join(base,'application');
  await mkdir(path.join(repo,'scripts/data'),{recursive:true});
  await writeFile(path.join(repo,'package.json'),JSON.stringify({name:'reference-genesis',private:true,type:'module',dependencies:{'@code-makers/rebel':'0.1.0-alpha.8.16'},scripts:{start:'node scripts/server.js'}}));
  await writeFile(path.join(repo,'scripts/data/runtime.seed.json'),JSON.stringify({items:[{id:1}]}));
  await writeFile(path.join(repo,'scripts/server.js'),'console.log("Genesis")');
  await writeFile(path.join(repo,'.gitignore'),'node_modules/\n');
  await writeFile(path.join(repo,'comands.txt'),'should be omitted');
  execFileSync('git',['init','-b','main'],{cwd:repo,stdio:'ignore'});
  execFileSync('git',['-c','user.name=Test','-c','user.email=test@example.invalid','add','.'],{cwd:repo,stdio:'ignore'});
  execFileSync('git',['-c','user.name=Test','-c','user.email=test@example.invalid','commit','-m','test'],{cwd:repo,stdio:'ignore'});
  await mkdir(dest);
  await writeFile(path.join(dest,'package.json'),JSON.stringify({name:'test-project',dependencies:{'@code-makers/rebel':'0.1.0-alpha.8.18'}}));
  const output=execFileSync(process.execPath,[cli,'init','proto'],{cwd:dest,encoding:'utf8',env:{...process.env,REBEL_GENESIS_REPO:repo,REBEL_SKIP_INSTALL:'1'}});
  assert.match(output,/Initialized CODEMAKERS REBEL Genesis/);
  const packageJson=JSON.parse(await readFile(path.join(dest,'package.json'),'utf8'));
  assert.equal(packageJson.dependencies['@code-makers/rebel'],'0.1.0-alpha.8.18');
  assert.equal(packageJson.scripts.start,'node scripts/server.js');
  assert.equal(JSON.parse(await readFile(path.join(dest,'scripts/data/runtime.json'),'utf8')).items.length,1);
  const ignore=await readFile(path.join(dest,'.gitignore'),'utf8');
  assert.match(ignore,/scripts\/data\/runtime\.json/);
  assert.equal(await exists(path.join(dest,'.git')),false);
  assert.equal(await exists(path.join(dest,'vendor')),false);
  assert.equal(await exists(path.join(dest,'comands.txt')),false);
  assert.equal(await exists(path.join(dest,'package-lock.json')),false);
 }finally{await rm(base,{recursive:true,force:true,maxRetries:5,retryDelay:30})}
});
