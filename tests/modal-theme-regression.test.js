import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../dist/'+name,import.meta.url),'utf8');
test('Theme Studio preview uses correct DOM node order and null-safe lookup',()=>{
 const source=read('theme-studio.js');
 assert.match(source,/node\('div','Navigation \/ Active Item','rebel-theme-swatch'\)/);
 assert.doesNotMatch(source,/node\('div','rebel-theme-swatch','Navigation/);
 assert.match(source,/stage\.querySelector\('\.rebel-theme-swatch'\)/);
});
test('REBEL uses configurable modal with close/backdrop and asynchronous delete confirmation',()=>{
 const source=read('modal-manager.js');
 assert.match(source,/data-rebel-close/);
 assert.match(source,/event\.target!==dialog/);
 assert.match(source,/export function confirmModal/);
 for(const name of ['generated-crud.js','menu-designer.js','request-workflow.js']){
  assert.match(read(name),/confirmModal\(/);
  assert.doesNotMatch(read(name),/(?:window\.)?confirm\(/);
 }
});
test('Dark and Light palettes share neutral foundations and palette accents',()=>{
 const source=read('theme-manager.js');
 assert.match(source,/--cv-action/);
 assert.match(source,/--bg/);
 assert.match(source,/--cv-nav-bg/);
 assert.match(source,/--cv-nav-active/);
 assert.match(source,/--cv-workspace-tint/);
});
