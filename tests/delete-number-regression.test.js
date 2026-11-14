import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../dist/'+name,import.meta.url),'utf8');
test('row actions are given the displayed ordinal; deletion uses immutable backend record id',()=>{
 assert.match(read('proto-ui.js'),/actions\(record,cell,\(page-1\)\*size\+offset\+1\)/);
 assert.match(read('generated-crud.js'),/record #\$\{rowNumber\}/);
 assert.match(read('generated-crud.js'),/url\+'\/'\+row\.id/);
 assert.match(read('menu-designer.js'),/record #\$\{rowNumber\}/);
});
