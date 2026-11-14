/* JSONB-driven CRUD. Schemas are data, not executable JS. Server validates writes. */
export function createCrudEngine({registry,store,api,pager,toast,manageRow=null,auditExport=null,endpointPrefix='/api/'}={}){
 const ViewRegistry=registry;const SimpleStore=store;
 const $=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const supports=key=>{const v=ViewRegistry[key];return Boolean(v&&(!v.type||['crud','table'].includes(v.type)))};
 let epoch=0;
 // Lookups are intentionally fresh on every modal/view entry.
 async function catalog(url){const data=await request(url);return data.items||[];}
 const json=(method,payload)=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
 const request=(url,options)=>api.request(url,options);
 function notice(msg,error=false){const host=$('message');if(host)host.textContent='';if(msg)toast?.show(msg,error?'danger':'success')}
 let dialog;
 function ensureDialog(){if(dialog)return dialog;dialog=document.createElement('dialog');dialog.className='oaact-crud-dialog';dialog.setAttribute('aria-label','Formulario');dialog.innerHTML='<div class="oaact-dialog-head"><h3 id="crudDialogTitle"></h3><button class="btn btn--ghost" type="button" id="crudClose" aria-label="Cerrar">✕</button></div><form id="crudDialogForm" class="oaact-form-modal"></form>';document.body.append(dialog);$('crudClose').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});return dialog}
 function nodeField(field,row,editing,options){const label=document.createElement('label');label.className='oaact-field';label.textContent=field.label||field.key;let input;
  if(field.type==='select'){
   input=document.createElement('select');input.append(new Option('Seleccione…',''));
   for(const entry of options[field.key]||field.options||[])input.append(new Option(entry[field.optionLabel||'nombre'],entry[field.optionValue||'id']));
  }else if(field.type==='json'){
   input=document.createElement('textarea');input.rows=4;input.placeholder='{}';
  }else if(field.type==='checkbox'){
   input=document.createElement('input');input.type='checkbox';input.checked=row?Number(row[field.key])===1:true;
  }else{input=document.createElement('input');input.type=field.type==='number'?'number':'text';if(field.maxLength)input.maxLength=field.maxLength;if(field.pattern)input.pattern=field.pattern;}
  input.name=field.key;input.required=field.type==='checkbox'?false:!!field.required;
  if(row&&field.type!=='checkbox')input.value=field.type==='json'?JSON.stringify(row[field.key]??{},null,2):String(row[field.key]??'');
  if(editing&&field.editable===false)input.disabled=true;
  label.append(input);return label;
 }
 async function formModal(schema,row,onDone){
  const editing=Boolean(row);const fields=(schema.fields||[]).filter(f=>editing?true:f.creatable!==false);
  const options={};
  await Promise.all(fields.filter(f=>f.type==='select'&&f.source).map(async f=>{options[f.key]=await catalog(f.source)}));
  const modal=ensureDialog();$('crudDialogTitle').textContent=(editing?'Editar ':'Crear ')+schema.title.toLowerCase();const form=$('crudDialogForm');form.replaceChildren();
  for(const field of fields)form.append(nodeField(field,row,editing,options));
  const footer=document.createElement('div');footer.className='oaact-dialog-actions';footer.innerHTML='<button type="button" class="btn btn--ghost" id="crudCancel">Cancelar</button><button type="submit" class="btn btn--primary">Guardar</button>';
  form.append(footer);footer.querySelector('#crudCancel').onclick=()=>modal.close();
  form.noValidate=true;
  form.onsubmit=async e=>{e.preventDefault();const invalid=[...form.elements].find(el=>el.willValidate&&!el.checkValidity());if(invalid){notice((invalid.closest('label')?.firstChild?.textContent||invalid.name||'Campo')+': '+invalid.validationMessage,true);invalid.focus();return;}
   try{const data={};for(const f of fields){const input=form.elements.namedItem(f.key);if(!input||input.disabled)continue;data[f.key]=f.type==='checkbox'?(input.checked?1:0):f.type==='json'?JSON.parse(input.value||'{}'):f.type==='select'?(f.source?Number(input.value):input.value):input.value.trim()}
   // Catalog update accepts only nombre and activo.
   const payload=editing&&schema.endpoint.endsWith('/catalogs')?{nombre:data.nombre,activo:data.activo,configuracion:data.configuracion}:data;
   const action=editing?'PUT':'POST',target=schema.endpoint+(editing?'/'+encodeURIComponent(row.id):'');
   const submit=footer.querySelector('[type=submit]');submit.disabled=true;
   try{await request(target,json(action,payload));modal.close();notice('Cambios guardados y auditados');await onDone()}
   catch(err){notice(err.message,true)}finally{submit.disabled=false}
   }catch(err){notice('Configuración JSON inválida: '+err.message,true)}
  };
  modal.showModal();
 }
 function renderTable(schema,items,onEdit){
  const table=document.createElement('table');table.className='admin-table';
  const head=document.createElement('thead'),row=document.createElement('tr');
  for(const column of schema.columns){const th=document.createElement('th');th.textContent=schema.fields?.find(f=>f.key===(typeof column==='string'?column:column.field))?.label||column;row.append(th)}
  if(schema.actions?.includes('edit')||schema.actions?.includes('manage')){const th=document.createElement('th');th.textContent='Acciones';row.append(th)}head.append(row);table.append(head);
  const body=document.createElement('tbody');for(const item of items){const tr=document.createElement('tr');
   for(const col of schema.columns){const td=document.createElement('td');td.dataset.label=schema.fields?.find(f=>f.key===(typeof col==='string'?col:col.field))?.label||col;td.textContent=(col==='activo'||col==='activa'||col==='revocado'||col==='revocada')?(Number(item[col])===1?'Sí':'No'):String(item[col]??'—');tr.append(td)}
   if(schema.actions?.includes('edit')||schema.actions?.includes('manage')){const td=document.createElement('td');td.dataset.label='Acciones';const button=document.createElement('button');button.type='button';button.className='btn btn--ghost';button.textContent=schema.actions?.includes('manage')?'Gestionar':'Editar';button.onclick=()=>onEdit(item);td.append(button);tr.append(td)}body.append(tr)
  }table.append(body);return table;
 }
 async function open(key){
  if(!supports(key))return false;
  const current=++epoch,tools=$('tools'),result=$('result');tools.replaceChildren();result.replaceChildren();notice('');
  let schema=ViewRegistry[key]; // One bootstrap fetch loads all published definitions; no per-view configuration GET.
  if(schema?.type==='crud'&&schema.components?.some(c=>c.type==='dataTable')){
   const table=schema.components?.find(c=>c.type==='dataTable')||{};
   schema={title:schema.title,endpoint:schema.dataSources?.[table.dataSource]?.endpoint||schema.actions?.create?.endpoint,
    fields:(schema.form?.fields||[]).map(f=>({...f,key:f.key||f.name})),
    columns:(table.columns||[]).map(c=>typeof c==='string'?c:c.field),
    actions:['create','edit'],pageSize:table.pagination?.default||5,pageSizes:table.pagination?.options||[5,10,50,100],mobileLayout:table.responsive||'cards'};
  }
  if(current!==epoch)return true;
  if(schema?.type==='table'){schema={...schema,readOnly:true,actions:[],fields:schema.fields||[],columns:schema.columns||schema.components?.find(c=>c.type==='table')?.columns||[],pageSize:schema.pageSize||20,endpoint:schema.endpoint||schema.components?.find(c=>c.type==='table')?.source};}
  if(!schema||typeof schema.endpoint!=='string'||!schema.endpoint.startsWith('/api/')||!Number.isInteger(schema.pageSize)||schema.pageSize<1||schema.pageSize>100){notice('Configuración de vista inválida',true);return true}
  let page=1,pageSize=pager.remembered(key),search='',debounce,extraFilter='',items=[],allItems=[];
  const toolbar=document.createElement('div');toolbar.className='oaact-crud-toolbar';
  // El título ya está en el encabezado principal; no duplicarlo.
  const title=document.createElement('h3');title.textContent=schema.title;
  const input=document.createElement('input');input.type='search';input.placeholder='Buscar registros…';input.setAttribute('aria-label','Buscar');
  const add=document.createElement('button');add.type='button';add.className='btn btn--primary';add.textContent='+ Nuevo';
  if(!schema.readOnly&&schema.actions?.includes('create'))toolbar.append(add);toolbar.append(input);tools.append(toolbar);
  if(auditExport && key==='audit')auditExport({toolbar,api,notice,document});
  if(schema.filters?.length && key!=='departments' && key!=='municipalities'){
   for(const filter of schema.filters){const label=document.createElement('label');label.className='oaact-filter-label';label.textContent=filter.label+' ';const select=document.createElement('select');select.append(new Option('Todos',''));
    try{const choices=await catalog(filter.source);for(const choice of choices)select.append(new Option(choice[filter.optionLabel||'nombre'],choice[filter.optionValue||'id']))}catch(e){notice(e.message,true)}
    select.onchange=()=>{page=1;extraFilter=select.value;load()};label.append(select);tools.insertBefore(label,tools.firstChild);
   }
  }
  let loadEpoch=0;
  function render(items,total){if(current!==epoch)return;
   result.replaceChildren();
   if(items.length)result.append(renderTable(schema,items,row=>schema.actions?.includes('manage')?manageRow?.(row):formModal(schema,row,load)));
   else {const blank=document.createElement('p');blank.className='admin-meta';blank.textContent='No hay registros para mostrar.';result.append(blank)}
   const nav=document.createElement('nav');result.append(nav);
   pager.mount(nav,{total,page,size:pageSize,key,onChange:(p,n)=>{page=p;pageSize=n;renderLocal()}});
  }
  // One fresh GET on every view entry, search, filter, or successful mutation.
  // Paging is always performed in memory; no GET is issued for page changes.
  function renderLocal(){
   const term=search.toLocaleLowerCase();
   const filtered=allItems.filter(row=>{
    if(extraFilter&&String(row.departamento_id)!==String(extraFilter))return false;
    return !term||Object.values(row).some(value=>value!==null&&value!==undefined&&String(value).toLocaleLowerCase().includes(term));
   });
   page=Math.max(1,Math.min(page,Math.ceil(filtered.length/pageSize)||1));
   render(filtered.slice((page-1)*pageSize,page*pageSize),filtered.length);
  }
  async function load(){
   const seq=++loadEpoch;
   try{
    const data=await request(schema.endpoint+'?all=1');
    if(current!==epoch||seq!==loadEpoch)return;
    if(data.truncated)throw Error('La API devolvió una lista incompleta; revise el límite del servidor.');
    allItems=Array.isArray(data)?data:(data.items||[]);
    renderLocal();
   }catch(e){if(current===epoch&&seq===loadEpoch)notice('Error al consultar: '+e.message,true)}
  }
  input.oninput=()=>{clearTimeout(debounce);debounce=setTimeout(()=>{page=1;search=input.value.trim();renderLocal()},300)};
  if(!schema.readOnly&&schema.actions?.includes('create'))add.onclick=()=>formModal(schema,null,()=>{page=1;return load()});await load();return true;
 }
 return Object.freeze({supports,open});
}
