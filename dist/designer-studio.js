import {renderViewPreview} from '/codeview/code-builder.js';
import {viewTemplate,validateViewDefinition} from '/codeview/view-templates.js';
const E=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
const api=(url,opts)=>window.codeview.api.request(url,opts);
const json=(method,obj)=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(obj)});
const message=(txt,error=false)=>window.codeview?.toast?.show(txt,error?'danger':'success');
const button=(text,cb,cls='btn btn--ghost')=>{const b=E('button',text,cls);b.type='button';b.onclick=cb;return b};
const inputField=(caption,value='',type='text')=>{const label=E('label',caption,'cv-studio-field'),input=E('input');input.type=type;input.value=value;label.append(input);return {label,input}};
const selector=(caption,choices)=>{const label=E('label',caption,'cv-studio-field'),input=E('select');for(const [value,name] of choices)input.append(new Option(name,value));label.append(input);return {label,input}};
const editor=()=>{const el=E('textarea',undefined,'cv-code-editor');el.spellcheck=false;el.rows=23;return el};
const studioLayout=(host)=>{
 const grid=E('div',undefined,'cv-editor-layout'),left=E('section'),right=E('section');
 left.append(E('h3','JSON de la vista'));right.append(E('h3','Configuración y vista previa'));
 grid.append(left,right);host.append(grid);return {left,right};
};
function previewWidget(host,getData){
 const bar=E('div',undefined,'cv-studio-toolbar cv-preview-actions');
 const openPreview=(mobile=false)=>{
  try{const config=getData();const dialog=E('dialog',undefined,'cv-full-dialog oaact-crud-dialog'+(mobile?' cv-mobile-shell':''));
   const header=E('div',undefined,'cv-full-head');header.append(E('h3',config.title+(mobile?' · móvil':'')),button('Cerrar',()=>dialog.close()));
   const body=E('div',undefined,'cv-full-content');if(mobile)body.classList.add('cv-mobile-preview');
   dialog.append(header,body);document.body.append(dialog);
   dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();renderViewPreview(body,config,{toast:window.codeview?.toast,mobile});
  }catch(err){message(err.message,true)}
 };
 const full=button('⛶ Vista completa',()=>openPreview(false),'btn btn--primary');
 const mobile=button('📱 Vista móvil',()=>openPreview(true),'btn btn--ghost');
 bar.append(full,mobile);
 const preview=E('div',undefined,'cv-preview');host.append(bar,preview);
 const render=()=>{try{preview.replaceChildren();renderViewPreview(preview,getData(),{toast:window.codeview?.toast,mobile:false})}catch(e){preview.replaceChildren(E('p',e.message,'admin-meta'))}};
 return {render};
}
export async function mountDesignerSection(host,kind){host.replaceChildren();
 const labels={generator:'View Designer',views:'View Designer',theme:'Theme Studio'};
 try{if(kind==='generator'||kind==='views')return await viewDesigner(host);if(kind==='theme')return await themeStudio(host)}
 catch(e){message(e.message,true);host.append(E('p',e.message,'admin-meta'))}
}
async function viewDesigner(host){
 host.append(E('p','Crea vistas desde modelos, tablas o plantillas; edita el JSON, prueba la vista completa y publica una revisión cuando esté lista.','admin-meta'));
 let selected='',latest=0,isNew=false,revisionToPublish=0,available=[],modelItems=[];
 const toolbar=E('div',undefined,'cv-studio-toolbar cv-studio-toolbar--main');
 const choose=selector('Vista existente',[['','Seleccionar vista…']]);
 const newButton=button('+ Nueva vista',()=>startNew(),'btn btn--primary');
 toolbar.append(choose.label,newButton);host.append(toolbar);
 const panel=E('div'),{left,right}=studioLayout(panel);
 const area=editor(),status=E('p',undefined,'admin-meta');left.append(area,status);
 const getData=()=>validateViewDefinition(JSON.parse(area.value));
 const meta=E('section',undefined,'cv-studio-config');meta.append(E('h3','Configuración'));
 const type=selector('Tipo',[['crud','CRUD desde modelo'],['table','Tabla de consulta'],['custom','Vista libre']]);
 const model=selector('Modelo JSON',[['','Seleccionar modelo…']]);
 const viewKey=inputField('Código de vista','mi_vista');const title=inputField('Título','Mi vista');
 const module=selector('Módulo',[['shared','Compartidas']]);
 const route=inputField('Ruta','/app/mi_vista');const source=inputField('Endpoint','/api/mi_vista');
 const generate=button('Preparar configuración',()=>prepareTemplate());
 meta.append(type.label,model.label,viewKey.label,title.label,module.label,route.label,source.label,generate);right.append(meta);
 const visible=E('div',undefined,'cv-columns-grid'),columnGroup=E('section',undefined,'cv-studio-columns');columnGroup.append(E('h3','Columnas visibles'),visible);right.append(columnGroup);
 const pvHost=E('section',undefined,'cv-studio-preview-card');pvHost.append(E('h3','Previsualización'));const pv=previewWidget(pvHost,getData);right.append(pvHost);
 const history=E('div',undefined,'cv-designer-history');history.hidden=true;
 const controls=E('div',undefined,'cv-studio-actions');
 const save=button('Guardar borrador',saveDraft,'btn btn--primary'),publish=button('Publicar revisión',publishRevision),historyBtn=button('Historial',()=>{history.hidden=!history.hidden});
 controls.append(save,publish,historyBtn);right.append(controls,history);host.append(panel);panel.hidden=true;
 const fieldsFromModel=()=>{const item=modelItems.find(m=>m.table===model.input.value);return item?.fieldDefinitions||(item?.fieldNames||[]).map(name=>({name}))||[]};
 function controlsForType(){model.label.hidden=type.input.value!=='crud';source.label.hidden=type.input.value==='custom';generate.hidden=!isNew;viewKey.input.disabled=!isNew;type.input.disabled=!isNew;model.input.disabled=!isNew;source.input.disabled=!isNew}
 function syncFromJson(){try{const cfg=getData();title.input.value=cfg.title||'';route.input.value=cfg.route||'';type.input.value=cfg.type||'custom';source.input.value=cfg.endpoint||'';if(cfg.model)model.input.value=cfg.model;controlsForType()}catch{}}
 function refresh(){try{const cfg=getData();status.textContent='JSON válido · Previsualización sin guardar';visible.replaceChildren();
   const keys=(cfg.fields||[]).map(f=>typeof f==='string'?{key:f,label:f}:f);
   const selectedCols=new Set((cfg.columns||[]).map(c=>typeof c==='string'?c:c.field).filter(Boolean));
   if(!keys.length)visible.append(E('p','Esta vista no tiene campos configurados.','admin-meta'));
   for(const field of keys){const l=E('label',undefined,'cv-check-item'),checkbox=E('input');checkbox.type='checkbox';checkbox.checked=selectedCols.has(field.key);l.append(checkbox,document.createTextNode(' '+(field.label||field.key)));
    checkbox.onchange=()=>{const next=getData();const cols=(next.columns||[]).map(c=>typeof c==='string'?c:c.field).filter(Boolean);next.columns=checkbox.checked?[...new Set([...cols,field.key])]:cols.filter(v=>v!==field.key);area.value=JSON.stringify(next,null,2);refresh()};visible.append(l)}
   pv.render();syncFromJson();
  }catch(e){status.textContent=e.message;visible.replaceChildren();pv.render()}}
 area.oninput=refresh;
 // Form controls and JSON are two editors of the same definition.
 function updateJsonFromControls(){
  try{const cfg=JSON.parse(area.value);cfg.title=title.input.value.trim();cfg.route=route.input.value.trim();
   if(isNew&&cfg.type==='table'){
    cfg.endpoint=source.input.value.trim();
    for(const component of cfg.components||[])if(component.type==='table')component.source=cfg.endpoint;
   }
   area.value=JSON.stringify(cfg,null,2);refresh();
  }catch(e){status.textContent='JSON inválido: '+e.message}
 }
 title.input.addEventListener('input',updateJsonFromControls);
 route.input.addEventListener('input',updateJsonFromControls);
 source.input.addEventListener('input',()=>{if(isNew)updateJsonFromControls()});
 function prepareTemplate(){try{if(!isNew)throw Error('La generación solo está disponible para una nueva vista.');const k=viewKey.input.value.trim();if(!/^[a-z][a-z0-9_-]{1,79}$/.test(k))throw Error('Código inválido');
   const kind=type.input.value;if(kind==='crud'&&!model.input.value)throw Error('Selecciona un modelo.');
   const cfg=viewTemplate(kind,{key:k,title:title.input.value,model:model.input.value,source:kind==='crud'?'/api/'+model.input.value:source.input.value,fields:fieldsFromModel()});
   cfg.route=route.input.value.trim();validateViewDefinition(cfg);selected=k;area.value=JSON.stringify(cfg,null,2);refresh();message('Configuración preparada para previsualizar. Aún no se ha guardado.');
  }catch(e){message(e.message,true)}}
 function startNew(){isNew=true;latest=0;revisionToPublish=0;selected='';choose.input.value='';panel.hidden=false;history.replaceChildren();history.hidden=true;
  type.input.value='custom';viewKey.input.value='mi_vista';title.input.value='Mi vista';route.input.value='/app/mi_vista';source.input.value='/api/mi_vista';module.input.value='shared';
  area.value=JSON.stringify(viewTemplate('custom',{key:'mi_vista',title:'Mi vista'}),null,2);refresh();viewKey.input.focus()}
 async function reload(){const response=await api('/api/designer/views');available=response.items||[];const prior=choose.input.value;choose.input.replaceChildren(new Option('Seleccionar vista…',''));
  for(const v of available)choose.input.append(new Option(v.codigo+(v.activo?' · publicada':' · borrador')+' · v'+v.revision,v.codigo));choose.input.value=available.some(v=>v.codigo===prior)?prior:''}
 async function open(item){selected=item.codigo;latest=item.revision;revisionToPublish=latest;isNew=false;viewKey.input.value=selected;module.input.value=item.modulo_codigo||'shared';area.value=JSON.stringify(item.borrador||item.configuracion,null,2);panel.hidden=false;refresh();await loadHistory()}
 choose.input.onchange=()=>{const item=available.find(i=>i.codigo===choose.input.value);if(item)open(item)};
 async function loadHistory(){history.replaceChildren();if(isNew)return;const data=await api('/api/designer/views/'+encodeURIComponent(selected)+'/revisions');if(!data.items?.length)return;
  const choice=selector('Revisión',data.items.map(r=>[String(r.version),'Revisión '+r.version+' · '+r.origen]));choice.input.value=String(latest);choice.input.onchange=()=>{revisionToPublish=Number(choice.input.value)};
  history.append(choice.label,button('Restaurar como borrador',async()=>{try{const result=await api('/api/designer/views/'+encodeURIComponent(selected)+'/restore',json('POST',{version:revisionToPublish,expectedRevision:latest}));latest=result.revision;revisionToPublish=latest;area.value=JSON.stringify(result.configuracion,null,2);refresh();await loadHistory();message('Revisión restaurada como borrador')}catch(e){message(e.message,true)}}));
 }
 async function saveDraft(){try{const cfg=getData();let result;
  if(isNew){const code=viewKey.input.value.trim();if(!/^[a-z][a-z0-9_-]{1,79}$/.test(code))throw Error('Código inválido');if(cfg.route!==route.input.value.trim())throw Error('La ruta en JSON no coincide.');if(cfg.type!==type.input.value)throw Error('Pulsa Preparar configuración para aplicar el tipo de vista seleccionado.');
   // A single creation endpoint handles all three templates and registers standard CRUD permissions.
   result=await api('/api/designer/generate',json('POST',{key:code,model:cfg.model,kind:cfg.type,module:module.input.value,definition:cfg}));selected=code;isNew=false;
  }else result=await api('/api/designer/views/'+encodeURIComponent(selected),json('PUT',{configuracion:cfg,expectedRevision:latest}));
  latest=result.revision;revisionToPublish=latest;message('Borrador guardado · v'+latest);await reload();choose.input.value=selected;controlsForType();await loadHistory();}
  catch(e){message(e.message,true)}}
 async function publishRevision(){try{if(isNew||!latest)throw Error('Primero guarda el borrador');if(!window.confirm('¿Publicar la revisión '+revisionToPublish+'?'))return;
  await api('/api/designer/views/'+encodeURIComponent(selected)+'/publish',json('POST',{version:revisionToPublish,expectedRevision:latest}));message('Vista publicada. Se cargará en el siguiente bootstrap.');await reload();choose.input.value=selected}
  catch(e){message(e.message,true)}}
 type.input.onchange=controlsForType;
 const models=await api('/api/designer/models');modelItems=models.items||[];
 model.input.replaceChildren(new Option('Seleccionar modelo…',''));
 for(const item of modelItems)model.input.append(new Option(item.table,item.table));
 try{const boot=await api('/api/app/bootstrap');for(const mod of boot.modules||[]){const code=mod.codigo||mod.code;if(code&&![...module.input.options].some(o=>o.value===code))module.input.append(new Option(mod.nombre||code,code))}}catch{}
 controlsForType();await reload();
}
async function themeStudio(host){
 host.append(E('p','Selecciona una paleta y observa los cambios en la navegación de inmediato. Publicar confirma el cambio para toda la aplicación.','admin-meta'));
 const data=await api('/api/designer/theme');
 const fallback={name:'Petróleo ejecutivo',colors:{primary:'#267d85',accent:'#50c2b3'}};
 let published=structuredClone(data.configuracion||fallback);
 const presets=[['Petróleo ejecutivo','#267d85','#50c2b3'],['Vino sobrio','#674255','#b98d9d'],['Azul profundo','#2a526f','#7ca8be'],['Bosque refinado','#315e50','#83b9a1'],['Grafito','#475568','#a2b0bc'],['Ciruela','#614d6a','#b3a2bd'],['Arena','#78634b','#c0aa87'],['Oliva','#59654c','#adb993'],['Índigo','#4b567f','#99a9ca'],['Terracota','#80574f','#cca095']];
 const layout=E('div',null,'cv-editor-layout cv-theme-layout'),left=E('section'),right=E('section');
 left.append(E('h3','Selección de paleta'));right.append(E('h3','Vista previa en la aplicación'));
 const name=inputField('Nombre de la paleta');name.input.value=published.name||fallback.name;
 const selector=E('label','Paleta'),preset=E('select');selector.append(preset);
 preset.append(new Option('Personalizada','custom'));
 for(const [label] of presets)preset.append(new Option(label,label));
 const fields=new Map(),inputs=E('div',null,'cv-palette-inputs');
 for(const [key,label] of [['primary','Color del menú'],['accent','Color activo / acento']]){
  const l=E('label',label),input=E('input');input.type='color';input.value=published.colors[key]||fallback.colors[key];
  l.append(input);inputs.append(l);fields.set(key,input);
 }
 const status=E('p','Los cambios se están previsualizando.','admin-meta');
 const actions=E('div',null,'admin-actions'),confirm=button('Publicar esta paleta',async()=>{
  try{const colors={...published.colors,primary:fields.get('primary').value,accent:fields.get('accent').value};
   const result=await api('/api/designer/theme',json('PUT',{name:name.input.value.trim(),colors}));
   published=structuredClone(result.configuracion);window.codeview.theme?.applyPalette(published.colors);repaint();status.textContent='Paleta publicada y aplicada · revisión '+result.version;message('Paleta publicada');
  }catch(error){message(error.message,true)}
 }),cancel=button('Descartar cambios',()=>{name.input.value=published.name;for(const [k,v] of fields)v.value=published.colors[k]||fallback.colors[k];preset.value='custom';window.codeview.theme?.applyPalette(published.colors);repaint();status.textContent='Se restauró la paleta publicada.'});
 actions.append(confirm,cancel);left.append(selector,name.label,inputs,actions,status);
 const mock=E('div',null,'cv-nav-mock'),nav=E('div',null,'cv-nav-mock-sidebar'),main=E('div',null,'cv-nav-mock-main');
 nav.append(E('strong','CODEMAKERS'),E('div','Inicio','cv-nav-mock-active'),E('div','Administración'),E('div','Designer'));
 main.append(E('strong','Vista de ejemplo'),E('p','Los botones, formularios y datos mantienen su estilo funcional.','admin-meta'));mock.append(nav,main);right.append(mock,E('p','También se actualiza el menú real. El modo claro/oscuro permanece independiente.','admin-meta'));
 layout.append(left,right);host.append(layout);
 function repaint(){const colors={...published.colors,primary:fields.get('primary').value,accent:fields.get('accent').value};
  window.codeview.theme?.previewPalette(colors);
  mock.style.setProperty('--cv-primary',colors.primary);mock.style.setProperty('--cv-accent',colors.accent);
 }
 for(const field of fields.values())field.oninput=()=>{preset.value='custom';repaint();status.textContent='Vista previa sin publicar.'};
 preset.onchange=()=>{const entry=presets.find(p=>p[0]===preset.value);if(!entry)return;
  name.input.value=entry[0];fields.get('primary').value=entry[1];fields.get('accent').value=entry[2];repaint();status.textContent='Vista previa sin publicar.';
 };
 preset.value=presets.some(p=>p[0]===published.name)?published.name:'custom';repaint();
 document.addEventListener('codeview:admin-navigate',()=>window.codeview.theme?.applyPalette(published.colors),{once:true});
 if(data.revisions?.length){const box=E('details');box.append(E('summary','Historial de paletas'));
  const list=E('select');for(const rev of data.revisions)list.append(new Option('Revisión '+rev.version,rev.version));
  box.append(list,button('Restaurar revisión',async()=>{try{if(!window.confirm('¿Publicar nuevamente esta paleta histórica?'))return;
   const result=await api('/api/designer/theme/restore',json('POST',{version:Number(list.value)}));published=structuredClone(result.configuracion);
   name.input.value=published.name;for(const [k,v] of fields)v.value=published.colors[k]||fallback.colors[k];window.codeview.theme?.applyPalette(published.colors);repaint();message('Revisión restaurada');
  }catch(error){message(error.message,true)}}));host.append(box);
 }
}
