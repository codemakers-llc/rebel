import test from 'node:test';
import assert from 'node:assert/strict';
import {paletteTokens,normalizeIntensity} from '../dist/theme-manager.js';
const forest={primary:'#287758',accent:'#71c7a7'},terra={primary:'#a65b43',accent:'#e4a58d'};
for(const mode of ['light','dark']){
 test(`neutral surfaces remain constant across palettes in ${mode}`,()=>{
  const a=paletteTokens(forest,mode),b=paletteTokens(terra,mode);
  for(const key of ['--line','--cv-nav-text'])assert.equal(a[key],b[key],key);
  if(mode==='light')for(const key of ['--bg','--surface','--surface-2','--cv-nav-bg','--cv-workspace-tint'])assert.equal(a[key],b[key],key);
  if(mode==='dark')for(const key of ['--bg','--surface','--cv-nav-bg'])assert.notEqual(a[key],b[key],key);
  assert.notEqual(a['--cv-action'],b['--cv-action']);
  assert.notEqual(a['--cv-nav-active'],b['--cv-nav-active']);
  assert.notEqual(a['--cv-focus'],b['--cv-focus']);
 });
 test(`expressive surfaces are still restrained in ${mode}`,()=>{
  const a=paletteTokens(forest,mode),b=paletteTokens(forest,mode,'expressive');
  assert.notEqual(a['--cv-nav-bg'],b['--cv-nav-bg']);
  assert.equal(a['--cv-action'],b['--cv-action']);
 });
}
test('invalid intensity falls back to subtle',()=>assert.equal(normalizeIntensity('other'),'subtle'));
