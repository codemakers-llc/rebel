import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const cli=await readFile(new URL('../bin/rebel.js',import.meta.url),'utf8');
const css=await readFile(new URL('../starter/minimal.css',import.meta.url),'utf8');
test('minimal starter loads theme CSS and structured stage',()=>{
 assert.match(cli,/starter\/minimal\.css/);
 assert.match(cli,/rebel-starter/);
 assert.match(cli,/Listening \(HTTP server bound\)/);
 assert.match(css,/rebel-data-grid/);
 assert.match(css,/rebel-login-dialog/);
});
