import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const designer=readFileSync(new URL('../dist/view-designer.js',import.meta.url),'utf8');
const renderer=readFileSync(new URL('../dist/proto-ui.js',import.meta.url),'utf8');
test('protected source shows origin instead of stale demo JSON',()=>{assert.match(designer,/editable=false;editor.disabled=true/);assert.match(designer,/read-only configuration/);});
test('generated source can be selected and updated',()=>{assert.match(designer,/api\/views\/source/);assert.match(designer,/method:current\?'PUT':'POST'/);});
test('shared table has search, ordering, row numbers, compact paging',()=>{for(const re of [/rebel-toolbar-end/,/sortDir='desc'/,/rebel-row-number/,/5,10,50,100/])assert.match(renderer,re);});
