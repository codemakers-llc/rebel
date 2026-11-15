import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../dist/rebel-shell.css',import.meta.url),'utf8');const shell=readFileSync(new URL('../dist/app-shell.js',import.meta.url),'utf8');const theme=readFileSync(new URL('../dist/theme-manager.js',import.meta.url),'utf8');
test('REBEL shell styles are not trapped behind a lower-priority cascade layer',()=>{assert.doesNotMatch(css,/^@layer rebel, app/m);assert.match(css,/\.rebel-widget-card\{color:var\(--ink/);assert.match(css,/\.rebel-hero-content/)});
test('Hero creates an accessible profile selector and compact brand',()=>{assert.match(shell,/aria-label','Explore as /);assert.match(shell,/rebel-hero-brand/)});
test('Palette API remains intact',()=>{assert.match(theme,/export function paletteTokens/);assert.match(theme,/export function initTheme/)});
