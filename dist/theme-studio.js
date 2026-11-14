import {node,action,section,renderTable} from './proto-ui.js';
import {applyPalette,setTheme,setThemeIntensity} from './theme-manager.js';
const PRESETS={
 'Minimal':{primary:'#555d66',accent:'#9ba3ac'},
 'Original CodeView':{primary:'#167ca8',accent:'#5cc8f5'},
 'Deep CodeView Blue':{primary:'#07538e',accent:'#269cdb'},
 'Nightfall Blue':{primary:'#12365b',accent:'#4e90cf'},
 'Ocean Blue':{primary:'#0878a8',accent:'#4bc4e8'},
 'Indigo':{primary:'#5655a8',accent:'#9aa7f4'},
 'Forest':{primary:'#287758',accent:'#71c7a7'},
 'Midnight Navy':{primary:'#173552',accent:'#6cb0e0'},
 'Graphite':{primary:'#414e61',accent:'#a6b4c5'},
 'Royal Purple':{primary:'#6b46a3',accent:'#b29bd8'},
 'Terracotta':{primary:'#a65b43',accent:'#e4a58d'},
 'Ruby':{primary:'#a53751',accent:'#e38ba1'},
 'Teal':{primary:'#137e7c',accent:'#68c5c1'},
 'Slate Blue':{primary:'#435f8e',accent:'#a1b7d4'},
 'Amber':{primary:'#946111',accent:'#e2b763'}
};
/** Pure frontend designer: state and markup live in REBEL, persistence supplied by client. */
export async function mountThemeStudio(host,{notify=()=>{},request,initialTheme=null,onSaved=()=>{}}={}){
 const panel=section(host,'Theme Studio','');const layout=node('div',null,'rebel-theme-studio-grid');panel.append(layout);
 const controls=node('section',null,'panel'),preview=node('section',null,'panel');layout.append(controls,preview);
 controls.append(node('h3','Palette Selection'));
 const selectLabel=node('label','Color Palette'),select=node('select',null,'cv-field-control');
 for(const name of Object.keys(PRESETS))select.append(new Option(name,name));select.append(new Option('Custom','Custom'));selectLabel.append(select);controls.append(selectLabel);
 const modeLabel=node('label','Appearance'),mode=node('select',null,'cv-field-control');mode.append(new Option('Light Mode','light'),new Option('Dark Mode','dark'));modeLabel.append(mode);controls.append(modeLabel);
 const intensityLabel=node('label','Theme Intensity'),intensity=node('select',null,'cv-field-control');intensity.append(new Option('Subtle Accents (recommended)','subtle'),new Option('Expressive','expressive'));intensityLabel.append(intensity);controls.append(intensityLabel);
 const colors={};for(const [key,label] of [['primary','Primary Color'],['accent','Accent Color']]){
  const row=node('label',label),input=node('input');input.type='color';input.value=PRESETS['Minimal'][key];row.append(input);controls.append(row);colors[key]=input;
  input.oninput=()=>{select.value='Custom';paint()};
 }
 const actions=node('div',null,'toolbar');controls.append(actions);
 const btn=action('Apply & Save',save,'btn btn--primary');actions.append(btn);
 const historyBox=node('section',null,'rebel-theme-history');controls.append(historyBox);
 function paint(){setThemeIntensity(intensity.value,{persist:false});const theme={primary:colors.primary.value,accent:colors.accent.value};applyPalette(theme,{persist:false});setTheme(mode.value,{persist:false});preview.style.setProperty('--cv-primary',theme.primary);preview.style.setProperty('--cv-accent',theme.accent);stage.querySelector('.rebel-theme-swatch').style.background=theme.primary}
 select.onchange=()=>{const value=PRESETS[select.value];if(value){for(const key of Object.keys(colors))colors[key].value=value[key]}paint()};mode.onchange=paint;intensity.onchange=paint;
 preview.append(node('h3','Live Theme Preview'));
 const stage=node('div',null,'rebel-theme-preview-area');preview.append(stage);
 stage.append(node('div','Navigation / Active Item','rebel-theme-swatch'));
 const card=node('div',null,'rebel-theme-card');card.append(node('h4','Sample Card'),node('p','Forms, tables, navigation and dialogs share design tokens.'));stage.append(card);
 const mock=node('div',null,'rebel-theme-mock');const input=node('input');input.placeholder='Sample input';const dropdown=node('select');dropdown.append(new Option('Select an option','one'));mock.append(input,dropdown,action('Primary Action',()=>{},'btn btn--primary'));stage.append(mock);
 const table=node('table',null,'admin-table');table.innerHTML='<thead><tr><th>Name</th><th>Status</th></tr></thead><tbody><tr><td>Example item</td><td>Active</td></tr></tbody>';stage.append(table);
 function showHistory(rows){historyBox.replaceChildren(node('h4','Saved Theme Versions'));if(!rows.length){historyBox.append(node('p','No changes saved yet.','muted'));return}const list=node('ol');for(const e of rows.slice(-8).reverse())list.append(node('li',`v${e.version} · ${e.palette||'Custom'} · ${new Date(e.at).toLocaleString('en-US')}`));historyBox.append(list)}
 async function save(){try{const result=await request('/api/proto/theme',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({palette:select.value,mode:mode.value,intensity:intensity.value,colors:{primary:colors.primary.value,accent:colors.accent.value}})});showHistory(result.history||[]);onSaved(result);notify(`Theme saved · v${result.version}`)}catch(e){notify(e.message,true)}}
 try{const saved=initialTheme||await request('/api/proto/theme');const p=saved.palette==='Minimal / Graphite'?'Minimal':(saved.palette||'Custom');select.value=Object.hasOwn(PRESETS,p)?p:'Custom';mode.value=saved.mode||'light';intensity.value=saved.intensity==='expressive'?'expressive':'subtle';for(const key of Object.keys(colors))colors[key].value=saved.colors?.[key]||PRESETS['Minimal'][key];showHistory(saved.history||[])}catch(e){notify(e.message,true)}
 paint();
}
