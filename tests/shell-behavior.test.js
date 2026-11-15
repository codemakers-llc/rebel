import {test} from 'node:test';import assert from 'node:assert/strict';
import {createAuthStore,filterViewsByRole,createHeroLanding,createUserMenu} from '../dist/app-shell.js';
class El {
 constructor(tag){this.tag=tag;this.children=[];this.listeners={};this.attrs={};this.className='';this.hidden=false;this.isConnected=true}
 append(...els){this.children.push(...els);return this}setAttribute(k,v){this.attrs[k]=v}getAttribute(k){return this.attrs[k]}
 addEventListener(k,cb){this.listeners[k]=cb}removeEventListener(k){delete this.listeners[k]}
 click(){this.listeners.click?.({target:this})} contains(child){return this===child||this.children.some(x=>x.contains(child))}
 focus(){} set textContent(v){this._text=v} get textContent(){return this._text??''}
}
const prior=globalThis.document;const doc={createElement(tag){return new El(tag)},listeners:{},addEventListener(k,cb){this.listeners[k]=cb},removeEventListener(k){delete this.listeners[k]}};
test('Demo roles only filter UI and AuthStore notifies subscribers',()=>{
 const store=createAuthStore(),emitted=[];const dispose=store.subscribe(x=>emitted.push(x?.role||null));
 store.set({role:'evaluator'});
 assert.deepEqual(filterViewsByRole([{route:'/dashboard'},{route:'/review',roles:['evaluator']},{route:'/studio',roles:['admin']}],store.current.role).map(x=>x.route),['/dashboard','/review']);
 store.clear();dispose();assert.deepEqual(emitted,['evaluator',null]);
});
test('Hero demo profiles open on click and do not require credentials',()=>{
 globalThis.document=doc;try{let selected;const hero=createHeroLanding({title:'Genesis',profiles:[{name:'Administrator',role:'admin'}],onSelect:p=>{selected=p.role}});const grid=hero.children[0].children.find(x=>x.className==='rebel-hero-profiles');assert.ok(grid);grid.children[0].click();assert.equal(selected,'admin');assert.equal(grid.children[0].getAttribute('aria-label'),'Explore as Administrator')}finally{globalThis.document=prior}
});
test('User menu opens, closes, toggles theme and signs out',()=>{
 globalThis.document=doc;try{let themes=0,outs=0;const menu=createUserMenu({user:{name:'Administrator',role:'ADMIN'},onTheme:()=>themes++,onLogout:()=>outs++});const [button,panel]=menu.children;
 assert.equal(panel.hidden,true);button.click();assert.equal(panel.hidden,false);assert.equal(button.getAttribute('aria-expanded'),'true');
 panel.children.find(x=>x.textContent==='Toggle theme').click();assert.equal(panel.hidden,true);assert.equal(themes,1);
 button.click();panel.children.find(x=>x.textContent==='Sign out').click();assert.equal(outs,1);assert.equal(panel.hidden,true);
 }finally{globalThis.document=prior}
});
