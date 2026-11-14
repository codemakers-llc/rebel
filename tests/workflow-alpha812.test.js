import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../dist/'+name,import.meta.url),'utf8');
test('Request form has exactly one Submit action and never shows table-level Submit',()=>{
 const source=read('request-workflow.js');
 assert.match(source,/makeDialog\(source\?'Edit Request #[^\n]+,'Submit'\)/);
 assert.doesNotMatch(source,/Create & Submit|Save & Submit|Create Request'\)/);
 assert.match(source,/payload\.submit=true/);
 assert.doesNotMatch(source,/cell\.append\(action\(row,'Submit'/);
 assert.match(source,/await api\.request\('\/api\/requests\/'\+row\.id\)/);
});
test('Review has decision select and requires feedback only for rejection',()=>{
 const source=read('request-workflow.js');
 assert.match(source,/key:'decision'.*type:'select'/);
 assert.match(source,/feedback\.required=decision\.value==='reject'/);
 assert.match(source,/form.onsubmit=async/);
 assert.match(source,/\['Pending Review','Changes Requested'\]\.includes\(row\.status\)/);
 assert.doesNotMatch(source,/qualityScore|impactScore|feasibilityScore/);
});
test('Navigation closes opened dialogs before mounting another view',()=>{
 assert.match(read('rebel-app.js'),/document\.querySelectorAll\('dialog\[open\]'\)/);
});
test('Designer sorts view names, validates and keeps mobile card preview',()=>{
 const source=read('view-designer.js');
 assert.match(source,/\.sort\(\(a,b\)=>a\.name\.localeCompare/);
 assert.match(source,/rebel-force-mobile-cards/);
 assert.match(source,/async function save\(\)\{try\{const c=parse\(\)/);
 assert.doesNotMatch(source,/action\('New View'/);
});
