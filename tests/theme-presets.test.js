import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const text=readFileSync(new URL('../dist/theme-studio.js',import.meta.url),'utf8');
test('Theme Studio ships distinct CodeView blue palette and auto-preview on selection',()=>{assert.match(text,/Deep CodeView Blue/);assert.match(text,/Nightfall Blue/);assert.match(text,/select\.onchange=.*paint\(\)/);});
