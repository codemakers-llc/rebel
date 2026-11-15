import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('Optional app-shell and widgets remain browser-only and exported',async()=>{
 const entry=await readFile(new URL('../dist/index.js',import.meta.url),'utf8');
 assert.match(entry,/createWidgetDashboardView/);assert.match(entry,/createAuthStore/);assert.match(entry,/createHeroLanding/);
 const shell=await readFile(new URL('../dist/app-shell.js',import.meta.url),'utf8');assert.doesNotMatch(shell,/node:http|express|jwt|sqlite/i);
 const css=await readFile(new URL('../dist/rebel-shell.css',import.meta.url),'utf8');assert.match(css,/rebel-widget-grid/);assert.match(css,/rebel-profile-card/);
});
