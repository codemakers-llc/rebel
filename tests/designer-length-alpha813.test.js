import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeDesignerDefinition} from '../dist/view-designer.js';
test('CodeView normalizes legacy maxLength, sets length on text and preserves controls',()=>{
 const c=normalizeDesignerDefinition({fields:[{key:'name',type:'string',maxLength:60},{key:'memo',type:'text'},{key:'count',type:'integer'}]});
 assert.deepEqual(c.fields.map(x=>x.length),[60,500,undefined]);
 assert.equal('maxLength' in c.fields[0],false);
});
test('CodeView rejects invalid text field lengths before saving',()=>{
 assert.throws(()=>normalizeDesignerDefinition({fields:[{key:'name',type:'string',length:0}]}),/length/);
 assert.throws(()=>normalizeDesignerDefinition({fields:[{key:'name',type:'string',length:2100}]}),/length/);
});

test('default CodeView field lengths use 100 for strings and 500 for textareas',()=>{
 const c=normalizeDesignerDefinition({fields:[{key:'short',type:'string'},{key:'notes',type:'textarea'},{key:'contact',type:'email'},{key:'body',type:'text'}]});
 assert.deepEqual(c.fields.map(f=>f.length),[100,500,100,500]);
});
