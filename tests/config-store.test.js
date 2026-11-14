import test from 'node:test';
import assert from 'node:assert/strict';
import {createConfigStore} from '../dist/config-store.js';
test('ConfigStore indexes routes and patches theme without fetching or reloading views',()=>{
 const store=createConfigStore();let updates=0;store.subscribe(()=>updates++);
 store.load({views:[{file:'features/admin/dashboard.js',route:'/dashboard',version:'abc'}],modules:[],menuItems:[],theme:{mode:'light'}});
 assert.equal(store.getViewByRoute('/dashboard').version,'abc');
 assert.equal(store.getViewByFile('features/admin/dashboard.js').route,'/dashboard');
 store.patchTheme({mode:'dark'});assert.equal(store.getTheme().mode,'dark');assert.equal(updates,2);
 assert.throws(()=>store.load({views:[{route:'/a',file:'features/a.js'},{route:'/a',file:'features/b.js'}],modules:[],menuItems:[]}),/REBEL_BOOTSTRAP_VIEW_INVALID/);
});
