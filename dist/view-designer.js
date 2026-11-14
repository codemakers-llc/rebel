import {node,action,section,renderForm,renderTable} from './proto-ui.js';
const FIELDS=[{key:'name',label:'Name',type:'string',length:100,required:true},{key:'email',label:'Email',type:'email',length:100,required:true},{key:'quantity',label:'Quantity',type:'integer'},{key:'requiredBy',label:'Required By',type:'date'},{key:'approved',label:'Approved',type:'checkbox'}];
const allowed=['crud','new','table'];
const textFieldTypes=new Set(['string','text','textarea','email','url','tel','json']);
/** Normalize CodeView field metadata before validating or saving. This does not change field keys. */
export function normalizeDesignerDefinition(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Expected a CodeView JSON object');
 const config=structuredClone(raw);
 if(!Array.isArray(config.fields))throw Error('Define the fields array');
 for(const field of config.fields){
  if(!field||typeof field!=='object')throw Error('Invalid field definition');
  if(textFieldTypes.has(field.type)){
   const input=field.length??field.maxLength;
   const value=input===undefined?(field.type==='text'||field.type==='textarea'||field.type==='json'?500:100):Number(input);
   if(!Number.isInteger(value)||value<1||value>2000)throw Error(`Field ${field.key||'?'}: length must be an integer between 1 and 2000`);
   field.length=value;delete field.maxLength;
  } else {delete field.length;delete field.maxLength;}
 }
 return config;
}
function template(type='crud'){return {name:'Equipment Inventory',route:'/equipment-inventory',file:'features/equipment-inventory.js',icon:'package',template:type,endpoint:'/api/requests',fields:FIELDS}}
function valid(config){if(!config||!allowed.includes(config.template))throw Error('Choose CRUD, New / Form or Table Only');if(!/^[A-Za-z][A-Za-z0-9 _-]{0,79}$/.test(config.name||''))throw Error('Invalid view name');if(!/^\/[a-z0-9/_-]+$/.test(config.route||''))throw Error('Invalid route');if(!/^features\/[a-z][a-z0-9_/-]*\.js$/.test(config.file||'')||config.file.includes('..'))throw Error('Invalid feature path');if(!Array.isArray(config.fields)||config.fields.length<1||config.fields.length>24)throw Error('Define 1 to 24 fields');const keys=new Set();const types=new Set(['string','text','textarea','email','url','tel','number','integer','date','time','datetime-local','select','checkbox','boolean','json']);for(const f of config.fields){if(!/^[A-Za-z][A-Za-z0-9_]*$/.test(f.key||'')||keys.has(f.key))throw Error('Each field needs a unique key');if(typeof f.label!=='string'||!f.label.trim())throw Error('Field '+f.key+' needs a label');if(!types.has(f.type))throw Error('Unsupported field type: '+f.type);if(f.required!==undefined&&typeof f.required!=='boolean')throw Error('required must be boolean: '+f.key);if(textFieldTypes.has(f.type)&&(!Number.isInteger(f.length)||f.length<1||f.length>2000))throw Error('Text field '+f.key+' requires length (1–2000)');if(f.type==='select'&&(!Array.isArray(f.options)||!f.options.length))throw Error('Select field '+f.key+' must have options');keys.add(f.key)}if(typeof config.endpoint!=='string'||!/^\/api\/[a-z0-9/_-]+$/.test(config.endpoint))throw Error('Invalid API endpoint');return config}
function previewInto(target,config){target.replaceChildren();target.append(node('h3',config.name));const fields=config.fields||[];if(config.template==='crud'||config.template==='table'){
 const sample=Object.fromEntries(fields.map(f=>[f.key,f.type==='checkbox'?true:f.type==='integer'||f.type==='number'?7:f.type==='date'?'2026-11-12':f.type==='select'?String(f.options?.[0]||'Sample'):'Sample '+(f.label||f.key)]));
 renderTable(target,{columns:fields.slice(0,8).map(f=>({key:f.key,label:f.label||f.key})),items:[sample],pageSize:5});}
 if(config.template==='crud'||config.template==='new'){const form=node('form',null,'cv-form-grid');renderForm(form,fields);form.append(action('Save Record',()=>{},'btn btn--primary'));target.append(form)}
}
/** JSON is the editable source displayed at left. Saved metadata is written into generated JS by the PROTO server. */
export async function mountViewDesigner(host,{api,notify=()=>{},reloadMenu=()=>{}}={}){
 const root=section(host,'View Designer','');
 const top=node('div',null,'toolbar rebel-designer-top');root.append(top);const selectLabel=node('label','Existing Views'),select=node('select');selectLabel.append(select);top.append(selectLabel);
 const typeWrap=node('label','View Type');const types=node('select',null,'rebel-designer-type');typeWrap.append(types);for(const [value,name] of [['crud','CRUD'],['new','New / Form'],['table','Table Only']])types.append(new Option(name,value));top.append(typeWrap);
 const workspace=node('div',null,'rebel-designer-layout'),left=node('section'),right=node('section');workspace.append(left,right);root.append(workspace);
 left.append(node('h3','JSON Definition'));const editor=node('textarea',null,'rebel-designer-json');editor.spellcheck=false;left.append(editor);
 right.append(node('h3','Live Preview'));const live=node('div',null,'panel rebel-native-preview');right.append(live);
 const bar=node('div',null,'toolbar'),status=node('p','Select an existing generated view or create a new one.','muted');root.append(bar,status);
 let current=null,views=[],draft=template(),editable=true;
 function show(config){config=normalizeDesignerDefinition(config);draft=config;editable=true;editor.disabled=false;editor.value=JSON.stringify(config,null,2);types.value=config.template;try{previewInto(live,config);status.textContent='Ready to edit'}catch(e){status.textContent=e.message}}
 function parse(){if(!editable)throw Error('This view is maintained in source code; select a generated view or create a new view');try{return valid(normalizeDesignerDefinition(JSON.parse(editor.value)))}catch(e){throw Error('JSON definition: '+e.message)}}
 function renderSafe(){try{previewInto(live,parse());status.textContent='Valid JSON · Preview updated'}catch(e){status.textContent=e.message;live.replaceChildren(node('p','Fix the JSON to update preview.','muted'))}}
 editor.addEventListener('input',renderSafe);
 types.onchange=()=>{if(!editable){types.value=draft.template;notify('This handwritten view is read-only',true);return;}let c;try{c=JSON.parse(editor.value)}catch{c=draft}c={...c,template:types.value};show(c)};
 async function fetchViews(){const res=await api.request('/api/views');views=[...(res.views||[])].sort((a,b)=>a.name.localeCompare(b.name,undefined,{sensitivity:'base'}));select.replaceChildren(new Option('+ Create New View',''));for(const v of views)select.append(new Option(v.name+' · '+v.route,v.file))}
 async function selectView(){if(!select.value){current=null;show(template(types.value));return}const v=views.find(v=>v.file===select.value);if(!v)return;const res=await api.request('/api/views/source?file='+encodeURIComponent(v.file));if(!res.editable){current=null;editable=false;editor.disabled=true;editor.value=res.definition?JSON.stringify({...res.definition,route:v.route,file:v.file},null,2):(res.source||'No declarative configuration available');live.replaceChildren();const card=node('div',null,'rebel-component-preview');card.append(node('h3',res.definition?.title||v.name),node('p',res.definition?.component?'Project component: '+res.definition.component:'Handwritten JavaScript view'));for(const endpoint of res.definition?.endpoints||[])card.append(node('p',endpoint,'muted'));live.append(card);status.textContent='Project component · read-only configuration · '+v.file;types.value=v.generatedType||'crud';return}
  current=v;const def=res.definition;show({name:def.title||v.name,route:v.route,file:v.file,icon:v.icon,template:def.template||def.type||v.generatedType||'crud',endpoint:def.endpoint||'/api/requests',fields:def.fields||FIELDS});status.textContent='Editing generated source: '+v.file}
 select.onchange=()=>selectView().catch(e=>notify(e.message,true));
 async function save(){try{const c=parse();editor.value=JSON.stringify(c,null,2);previewInto(live,c);if(current&&c.file!==current.file)throw Error('An existing file path cannot be changed');await api.request(current?'/api/views/source':'/api/views',{method:current?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(c)});notify('View definition saved');await fetchViews();select.value=c.file;current=views.find(v=>v.file===c.file);status.textContent='Saved to '+c.file+' · Existing view updated; navigation is managed in Menu Designer';await reloadMenu();}catch(e){notify(e.message,true);status.textContent=e.message}}
 function modalPreview(mobile){let c;try{c=parse()}catch(e){notify(e.message,true);return}const dialog=node('dialog',null,'proto-dialog rebel-preview');const bar=node('div',null,'rebel-modal-header rebel-preview-header');const close=action('Close',()=>dialog.close(),'btn btn--ghost rebel-preview-close');close.dataset.rebelClose='';bar.append(mobile?close:node('h3','Web Preview'),mobile?node('h3','Mobile Preview'):close);const surface=node('div',null,mobile?'rebel-native-preview preview-mobile rebel-force-mobile-cards':'rebel-native-preview preview-web');previewInto(surface,c);dialog.append(bar,surface);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal()}
 bar.append(action('Adjust & Validate JSON',()=>{try{const config=parse();editor.value=JSON.stringify(config,null,2);previewInto(live,config);status.textContent='CodeView JSON adjusted and validated · Ready to save';notify('CodeView JSON validated')}catch(e){status.textContent=e.message;notify(e.message,true)}},'btn btn--ghost'),action('Web Preview',()=>modalPreview(false)),action('Mobile Preview',()=>modalPreview(true)),action('Save View',save,'btn btn--primary'));
 await fetchViews();select.value='';show(template());
}
