import test from 'node:test';import assert from 'node:assert/strict';import {defineView,createApiClient} from '../dist/index.js';
test('views validate and accept JS hooks',()=>{const obj=defineView({title:'Test',components:[],onMount(){}});assert.equal(typeof obj.onMount,'function');assert.throws(()=>defineView({components:[]}));});
test('API sends no-store and reports HTTP errors',async()=>{let options;const api=createApiClient({fetchImpl:async(_url,o)=>{options=o;return {ok:true,status:200,json:async()=>({items:[]})}}});await api.request('/api/users');assert.equal(options.cache,'no-store');});

test('Concurrent API requests remain active until the final request settles',async()=>{
 let releaseA,releaseB;const events=[];
 const fetchImpl=url=>new Promise(resolve=>{
   const finish=()=>resolve({ok:true,status:200,json:async()=>({url})});
   if(url==='/a')releaseA=finish;else releaseB=finish;
 });
 const api=createApiClient({fetchImpl,onBegin:()=>events.push('start'),onFinish:()=>events.push('end')});
 const first=api.request('/a'),second=api.request('/b');
 assert.deepEqual(events,['start','start']);
 releaseA();await first;assert.deepEqual(events,['start','start','end']);
 releaseB();await second;assert.deepEqual(events,['start','start','end','end']);
});
