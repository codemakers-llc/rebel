import {createCustomViewRenderer} from './custom-view.js';
// CodeBuilder edits JSON-compatible configuration and exports a native ES module.
// User input is never evaluated or imported as executable JavaScript.
function formatConfiguration(value){
 const raw=JSON.stringify(value,null,2);
 // Compact leaf objects (field/label/type) on one line, preserving array rows.
 return raw.replace(/\{\n((?:\s+"(?:[^"\\]|\\.)+": (?!\{)(?!\[)[^\n{}\[\]]+,?\n)+)\s*\}/g,(whole,fields)=>{
  const lines=fields.trim().split('\n').map(v=>v.trim());
  return lines.every(line=>line.length<160)?'{'+lines.join(' ')+'}':whole;
 });
}
function validateConfiguration(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('La vista debe ser un objeto');
 if(typeof input.title!=='string'||!input.title.trim())throw Error('Debe definir title');
 if(!Array.isArray(input.columns)||!Array.isArray(input.fields))throw Error('Se requieren columns y fields');
 const seen=new Set();
 for(const col of input.columns){const field=typeof col==='string'?col:col?.field;
  if(typeof field!=='string'||!field.trim()||seen.has(field))throw Error('Columna duplicada o sin campo: '+String(field));seen.add(field);
 }
 for(const field of input.fields){if(typeof field?.key!=='string'||!field.key.trim())throw Error('Cada field requiere key');}
 return input;
}
function node(tag,text,className){const el=document.createElement(tag);if(text!=null)el.textContent=text;if(className)el.className=className;return el}
export function mountCodeBuilder(host,{registry={},toast=null}={}){
 const ViewRegistry=registry;
 host.replaceChildren();
 const keys=Object.keys(ViewRegistry).sort();if(!keys.length){host.append(node('p','No existen vistas declarativas.'));return}
 let current=keys[0],valid=null;
 const bar=node('div',null,'oaact-crud-toolbar');
 const label=node('label','Vista: '),selector=document.createElement('select');
 for(const key of keys)selector.append(new Option(key,key));label.append(selector);
 const validateButton=node('button','Validar','btn btn--ghost');validateButton.type='button';
 const exportButton=node('button','Exportar .js','btn btn--primary');exportButton.type='button';
 const fullButton=node('button','Previsualizar completa','btn btn--ghost');fullButton.type='button';
 bar.append(label,validateButton,fullButton,exportButton);
 const layout=node('div',null,'cv-editor-layout');
 const left=document.createElement('section'),right=document.createElement('section');
 left.append(node('h3','Configuración declarativa'));
 const editor=document.createElement('textarea');editor.className='cv-code-editor';editor.spellcheck=false;
 editor.setAttribute('aria-label','Editor declarativo JSON; exportación a ES module');
 const status=node('p',null,'admin-meta');status.hidden=true;left.append(editor,status);
 right.append(node('h3','Vista previa'));
 const mobile=node('label'),mobileInput=document.createElement('input');mobileInput.type='checkbox';
 mobile.append(mobileInput,document.createTextNode(' Previsualizar tarjeta móvil'));right.append(mobile);
 const preview=node('div',null,'cv-preview');right.append(preview);layout.append(left,right);host.append(bar,layout);
 function paint(cfg,target=preview){renderViewPreview(target,cfg,{toast,mobile:mobileInput.checked})}
 function draw(){
  try{valid=validateConfiguration(JSON.parse(editor.value));status.textContent='';status.className='admin-meta';exportButton.disabled=false;paint(valid)}
  catch(error){valid=null;status.textContent='';status.className='admin-meta';exportButton.disabled=true;preview.replaceChildren(node('p','Corrige la configuración para visualizar los cambios.'))}
 }
 fullButton.onclick=()=>{if(!valid)return;const dialog=document.createElement('dialog');dialog.className='oaact-crud-dialog cv-full-dialog';const head=node('div',null,'cv-full-head');head.append(node('h3',valid.title+' · Vista completa'));
  const close=node('button','Cerrar','btn btn--ghost');close.type='button';close.onclick=()=>dialog.close();head.append(close);dialog.append(head);
  const full=node('div',null,'cv-full-content');paint(valid,full);dialog.append(full);
  document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();
 };
 function load(){current=selector.value;editor.value=formatConfiguration(ViewRegistry[current]);draw()}
 function exportSource(){
  if(!valid)return;
  const content='// CodeView: definición declarativa. No incluye datos operativos.\nexport default '+formatConfiguration(valid)+';\n';
  const blob=new Blob([content],{type:'text/javascript'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');
  anchor.href=url;anchor.download=current+'.js';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 selector.addEventListener('change',load);editor.addEventListener('input',draw);mobileInput.addEventListener('change',()=>{if(valid)paint(valid)});
 validateButton.addEventListener('click',()=>{draw();toast?.show(valid?'Configuración válida':'La configuración JSON tiene errores',''+(valid?'success':'danger'));});exportButton.addEventListener('click',exportSource);
 load();
}
export {formatConfiguration,validateConfiguration};

// Shared, side-effect-free preview of the view definition until a user clicks a simulated action.
export function renderViewPreview(target,cfg,{toast=null,mobile=false}={}){
 if(['custom','table'].includes(cfg.type)){const engine=createCustomViewRenderer({toast});target.classList.toggle('cv-mobile-preview',mobile);engine.open(target,cfg,{sample:true});return;}
 const node=(tag,text,className)=>{const el=document.createElement(tag);if(text!=null)el.textContent=text;if(className)el.className=className;return el};
 function fieldsOf(cfg){return new Map(cfg.fields.map(field=>[field.key,field]))}
 function paint(cfg,target){
  target.replaceChildren();target.classList.toggle('cv-mobile-preview',mobile);
  target.append(node('h4',cfg.title));
  const toolbar=node('div',null,'oaact-crud-toolbar');const create=node('button','+ Nuevo registro','btn btn--primary');create.type='button';
  const edit=node('button','Previsualizar edición','btn btn--ghost');edit.type='button';if(!cfg.readOnly){toolbar.append(create,edit);target.append(toolbar);}
  const fields=fieldsOf(cfg),table=node('table',null,'admin-table'),thead=document.createElement('thead'),tr=document.createElement('tr');
  for(const col of cfg.columns){const key=typeof col==='string'?col:col.field;tr.append(node('th',fields.get(key)?.label||col.label||key))}
  thead.append(tr);table.append(thead);
  const tbody=document.createElement('tbody'),row=document.createElement('tr');
  for(const col of cfg.columns){const key=typeof col==='string'?col:col.field,td=node('td','—');td.dataset.label=fields.get(key)?.label||col.label||key;row.append(td)}
  tbody.append(row);table.append(tbody);target.append(table);
  function showForm(mode){
   const modal=document.createElement('dialog');modal.className='oaact-crud-dialog cv-interactive-dialog';
   const title=node('h3',mode==='edit'?'Editar registro · Vista previa':'Nuevo registro · Vista previa');
   const note=node('p','Simulación interactiva: no se envían peticiones ni se guardan registros.','admin-meta');
   const form=node('form',null,'oaact-form-modal cv-form-grid');form.style.setProperty('--cv-form-cols',String([1,2,3,4].includes(cfg.layout?.columns)?cfg.layout.columns:1));const result=node('pre',null,'cv-payload');result.hidden=true;
   for(const field of cfg.fields){
    const item=node('label',field.label||field.key);item.className='cv-preview-field';const key=field.key;
    let input;
    if(field.type==='checkbox'){input=document.createElement('input');input.type='checkbox';input.checked=mode==='edit'||Boolean(field.default)}
    else if(field.type==='select'&&Array.isArray(field.options)){input=document.createElement('select');for(const option of field.options)input.append(new Option(String(option.label??option.value),String(option.value)))}
    else if(['json','textarea','textlong'].includes(field.type)){input=document.createElement('textarea');input.value=field.type==='json'?'{}':''}
    else{input=document.createElement('input');input.type=['number','date','email','time','datetime-local'].includes(field.type)?field.type:'text';input.placeholder=field.label||key}
    input.name=key;input.required=!!field.required;if(field.maxLength)input.maxLength=field.maxLength;if(field.minLength)input.minLength=field.minLength;if(field.pattern)input.pattern=field.pattern;
    item.append(input);form.append(item);
   }
   const buttons=node('div',null,'oaact-dialog-actions');const close=node('button','Cerrar','btn btn--ghost');close.type='button';close.onclick=()=>modal.close();const generate=node('button','Generar JSON','btn btn--primary');generate.type='submit';buttons.append(close,generate);form.append(buttons);
   form.noValidate=true;form.onsubmit=e=>{e.preventDefault();const invalid=[...form.elements].find(el=>el.willValidate&&!el.checkValidity());if(invalid){toast?.show((invalid.closest('label')?.firstChild?.textContent||invalid.name)+': '+invalid.validationMessage,'danger');invalid.focus();return;}const payload={};try{
    for(const field of cfg.fields){const input=form.elements.namedItem(field.key);if(!input)continue;payload[field.key]=field.type==='checkbox'?(input.checked?1:0):field.type==='number'?Number(input.value):field.type==='json'?JSON.parse(input.value||'{}'):input.value.trim()}
    result.textContent=JSON.stringify(payload,null,2);result.hidden=false;toast?.show('Objeto JSON generado localmente','success');
   }catch(error){toast?.show(error.message,'danger')}};
   modal.append(title,note,form,result);document.body.append(modal);modal.addEventListener('close',()=>modal.remove(),{once:true});modal.showModal();
  }
  create.onclick=()=>showForm('create');edit.onclick=()=>showForm('edit');
  target.append(node('p','Los registros son ilustrativos; no se consulta ninguna API durante la previsualización.','admin-meta'));
 }
 paint(cfg,target);
}
