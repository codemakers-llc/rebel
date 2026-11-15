import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const cli=await readFile(new URL('../bin/rebel.js',import.meta.url),'utf8');
const modal=await readFile(new URL('../dist/app-shell.js',import.meta.url),'utf8');
const css=await readFile(new URL('../starter/minimal.css',import.meta.url),'utf8');
test('starter shows auth adapter failures through the REBEL toast',()=>{
 assert.match(cli,/createToast/);
 assert.match(cli,/toastRegion\.id='oaactToastRegion'/);
 assert.match(cli,/onError:message=>toast\.show\(message,'warning'\)/);
 assert.match(modal,/typeof onError==='function'/);
 assert.match(css,/#oaactToastRegion/);
 assert.match(css,/\.oaact-toast--warning/);
});

test('CLI offers explicit local Genesis template validation',()=>{
 assert.match(cli,/init proto --local PATH/);
 assert.match(cli,/localPath:arg2==='--local'/);
});
