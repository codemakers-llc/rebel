// Shared palette and appearance engine for web and Cordova.
// Light and dark are two complete colorways of the same institutional palette.
export const THEME_KEY='rebel-theme';
export const PALETTE_KEY='codeview-palette';
export const TOKENS_LIGHT_KEY='codeview-palette-tokens-light';
export const TOKENS_DARK_KEY='codeview-palette-tokens-dark';
let currentPalette=null;
let currentIntensity='subtle';
export const normalizeIntensity=value=>value==='expressive'?'expressive':'subtle';
export function setThemeIntensity(value,{persist=true}={}){currentIntensity=normalizeIntensity(value);syncPalette();if(persist)try{localStorage.setItem('rebel-theme-intensity',currentIntensity)}catch{};return currentIntensity;}
export function getThemeIntensity(){return currentIntensity;}
const validHex=value=>typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value);
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const blend=(a,b,weight)=>'#'+rgb(a).map((value,i)=>Math.round(value*(1-weight)+rgb(b)[i]*weight).toString(16).padStart(2,'0')).join('');
const luminance=hex=>rgb(hex).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
const contrastText=hex=>luminance(hex)>.179?'#102332':'#ffffff';
// Neutral surfaces are controlled by appearance. Palettes change interaction accents,
// not the identity of every background. An optional expressive mode uses a slight tint.
export function paletteTokens(colors,mode='light',intensity='subtle'){
 const primary=colors.primary||'#287b80',accent=colors.accent||'#7caea3';
 const dark=mode==='dark',expressive=intensity==='expressive';
 // Dark surfaces retain a barely visible palette undertone; light stays neutral by default.
 // Expressive raises the tint only slightly. Graphite remains fully achromatic.
 const tint=(neutral,amount)=>blend(primary,neutral,expressive?amount:(dark?.965:1));
 const action=dark?blend(primary,'#17212a',.06):blend(primary,'#162334',.09);
 return {
  '--cv-primary':primary,'--cv-accent':accent,
  '--bg':tint(dark?'#14181e':'#f5f7f9',dark?.96:.975),
  '--surface':tint(dark?'#1d2229':'#ffffff',dark?.96:.985),
  '--surface-2':tint(dark?'#272d35':'#f6f8fa',dark?.95:.97),
  '--surface-3':tint(dark?'#313944':'#e9edf1',dark?.94:.955),
  '--surface-hover':tint(dark?'#303740':'#f0f3f6',dark?.93:.955),
  '--line':dark?'#373f49':'#dce2e8',
  '--line-strong':dark?'#48535f':'#c7d0d9',
  '--ink':dark?'#f0f3f6':'#192937',
  '--ink-2':dark?'#b8c1ca':'#576675',
  '--cv-nav-bg':tint(dark?'#22272e':'#eef2f5',dark?.96:.96),
  '--cv-nav-active':dark?blend(primary,'#323941',.87):blend(primary,'#e2e8ed',.87),
  '--cv-nav-hover':dark?blend(primary,'#343b44',.95):blend(primary,'#e5ebf0',.95),
  '--cv-nav-text':dark?'#e6eaf0':'#263847',
  '--cv-nav-icon':dark?'#b5bec7':'#596c7c',
  '--cv-nav-border':dark?'#383f49':'#dce3e9',
  '--cv-nav-muted':dark?'#a5b0ba':'#617182',
  '--cv-action':action,
  '--cv-action-hover':dark?blend(action,'#ffffff',.14):blend(action,'#10212d',.16),
  '--cv-action-text':contrastText(action),
  '--cv-focus':primary,'--cv-loader':accent,
  '--cv-workspace-tint':tint(dark?'#14181e':'#f5f7f9',dark?.96:.975),
  '--accent':action,'--accent-hover':dark?blend(action,'#ffffff',.14):blend(action,'#10212d',.16),
  '--ink-on-accent':contrastText(action)
 };
}

export function normalizeTheme(mode){return mode==='light'?'light':'dark'}

function persistPalette(){
 if(!currentPalette||typeof localStorage==='undefined')return;
 try{
  localStorage.setItem(PALETTE_KEY,JSON.stringify(currentPalette));
  localStorage.setItem(TOKENS_LIGHT_KEY,JSON.stringify(paletteTokens(currentPalette,'light',currentIntensity)));
  localStorage.setItem(TOKENS_DARK_KEY,JSON.stringify(paletteTokens(currentPalette,'dark',currentIntensity)));
 }catch{}
}
function syncPalette(){
 if(!currentPalette||typeof document==='undefined')return;
 const tokens=paletteTokens(currentPalette,document.documentElement.dataset.theme,currentIntensity);
 for(const [key,value] of Object.entries(tokens)){
  document.documentElement.style.setProperty(key,value);
  // Some host layouts define their own --surface/--bg on the page element.
  // Explicitly apply tokens there so switching palettes really updates the app.
  for(const host of document.querySelectorAll('.oa-admin-page'))host.style.setProperty(key,value);
 }
}
export function setTheme(mode,{persist=true}={}){
 const next=normalizeTheme(mode);
 if(typeof document==='undefined')return next;
 document.documentElement.dataset.theme=next;
 document.body?.classList.toggle('oaact-dark',next==='dark');
 syncPalette();
 if(persist)try{localStorage.setItem(THEME_KEY,next)}catch{}
 document.dispatchEvent(new CustomEvent('codeview:theme',{detail:{mode:next}}));
 return next;
}
export function applyPalette(colors,{persist=true}={}){
 if(!colors||typeof colors!=='object'||Array.isArray(colors))throw Error('INVALID_PALETTE');
 for(const [key,color] of Object.entries(colors))if(!['primary','accent','success','warning','danger'].includes(key)||!validHex(color))throw Error('INVALID_COLOR: '+key);
 currentPalette={...colors};syncPalette();if(persist)persistPalette();return colors;
}
export function initTheme({fetchPalette=null}={}){
 let mode='dark';try{mode=normalizeTheme((localStorage.getItem(THEME_KEY)||localStorage.getItem('oaact-theme')));currentIntensity=normalizeIntensity(localStorage.getItem('rebel-theme-intensity'))}catch{}
 try{const saved=JSON.parse(localStorage.getItem(PALETTE_KEY)||'null');if(saved)currentPalette=saved}catch{}
 setTheme(mode,{persist:false});
 if(typeof window!=='undefined')window.addEventListener('storage',event=>{
  if(event.key===THEME_KEY)setTheme(event.newValue,{persist:false});
  if(event.key==='rebel-theme-intensity')setThemeIntensity(event.newValue,{persist:false});
  if(event.key===PALETTE_KEY){
   try{const saved=JSON.parse(event.newValue||'null');if(saved)applyPalette(saved)}catch{}
  }
 });
 if(fetchPalette)Promise.resolve().then(fetchPalette).then(p=>applyPalette(p?.colors||p)).catch(()=>{});
 return {setTheme,setThemeIntensity,applyPalette,previewPalette:colors=>applyPalette(colors,{persist:false}),get mode(){return document.documentElement.dataset.theme}};
}
