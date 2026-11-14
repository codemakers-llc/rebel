import {enhanceModal} from './modal-manager.js';
/** REBEL frontend primitives. Project features supply configuration + API calls only. */
export const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=String(text);if(cls)n.className=cls;return n};
export const action=(title,handler,kind='btn btn--ghost')=>{const b=node('button',title,kind);b.type='button';b.addEventListener('click',handler);return b};
export function section(host,title,description=''){const el=node('section',null,'panel');if(!host.classList?.contains('rebel-view-stage'))el.append(node('h3',title));/* Shared tables keep descriptions out of the data panel. */host.append(el);return el}
export function modal(title){const d=node('dialog',null,'proto-dialog oaact-crud-dialog'),form=node('form',null,'cv-form-grid');d.append(node('h3',title),form);document.body.append(d);d.addEventListener('close',()=>d.remove(),{once:true});enhanceModal(d);d.showModal();return {dialog:d,form}}
export function field(form,definition,value){const d=definition,wrap=node('label',d.label||d.key),type=d.type||'string';let input;if(['text','textarea','json'].includes(type)){input=node('textarea');input.rows=3}else if(type==='select'){input=node('select');for(const v of d.options||[]){const item=typeof v==='object'?v:{label:v,value:v};input.append(new Option(String(item.label),String(item.value)))}}else{input=node('input');input.type=({string:'text',integer:'number',boolean:'checkbox'}[type]||type);if(input.type==='number'){input.step=type==='integer'?'1':'any';if(d.min!=null)input.min=d.min;if(d.max!=null)input.max=d.max}}
 input.name=d.key;if(d.required)input.required=true;if(['string','text','textarea','email','url','tel','json'].includes(type)){const defaultLength=['text','textarea','json'].includes(type)?500:100;input.maxLength=d.length??d.maxLength??defaultLength;}if(type==='checkbox'||type==='boolean'){wrap.classList.add('proto-checkbox-label','rebel-switch-field');input.classList.add('rebel-switch-input');input.setAttribute('role','switch');input.checked=Boolean(value)}else input.value=value??d.default??'';wrap.append(input);form.append(wrap);return input}
export function values(form,fields){const obj={};for(const f of fields){const el=form.elements.namedItem(f.key);if(!el)continue;let val=el.type==='checkbox'?el.checked:el.value;if(['integer','number'].includes(f.type))val=val===''?null:Number(val);if(f.type==='json'&&val)val=JSON.parse(val);obj[f.key]=val}return obj}
/** OAACT-style responsive table: one toolbar, client-side full-record search, stable sorting, 5/10/50/100 paging. */
export function renderTable(host,{columns,items=[],actions=null,pageSize=5,caption='Records',onNew=null,newLabel='New Record',search=true}={}){
 const root=node('div',null,'rebel-data-grid');
 const bar=node('div',null,'oaact-crud-toolbar rebel-table-toolbar');
 const left=node('div',null,'rebel-toolbar-start'),right=node('div',null,'rebel-toolbar-end');
 const input=node('input',null,'cv-field-control');input.type='search';input.placeholder='Search all fields…';input.setAttribute('aria-label','Search '+caption);
 if(onNew)left.append(action('+ '+newLabel,onNew,'btn btn--primary'));
 if(search)right.append(input);
 bar.append(left,right);
 const wrap=node('div',null,'admin-table-wrap'),pager=node('nav',null,'oaact-crud-pagination oaact-page-controls');pager.setAttribute('aria-label',`Pagination for ${caption}`);
 root.append(bar,wrap,pager);host.append(root);
 let page=1,size=pageSize,sortKey=items.some(item=>item.id!==undefined)?'id':'__position',sortDir='desc';
 const enriched=()=>items.map((record,index)=>({record,index}));
 const scalar=(value)=>value===null||value===undefined?'':typeof value==='object'?JSON.stringify(value):String(value);
 const compare=(x,y)=>{const av=sortKey==='__position'?x.index:x.record?.[sortKey],bv=sortKey==='__position'?y.index:y.record?.[sortKey];
  if(av===bv)return x.index-y.index;if(av==null)return 1;if(bv==null)return -1;
  const an=Number(av),bn=Number(bv);if(String(av).trim()!==''&&String(bv).trim()!==''&&Number.isFinite(an)&&Number.isFinite(bn))return an-bn;
  return String(av).localeCompare(String(bv),undefined,{numeric:true,sensitivity:'base'});
 };
 function draw(){
  const term=input.value.trim().toLocaleLowerCase();
  let list=enriched().filter(({record})=>!term||Object.values(record).some(value=>scalar(value).toLocaleLowerCase().includes(term)));
  list.sort((x,y)=>{const result=compare(x,y)*(sortDir==='asc'?1:-1);return result||y.index-x.index});
  const pages=Math.max(1,Math.ceil(list.length/size));page=Math.max(1,Math.min(page,pages));
  const table=node('table',null,'admin-table cv-generic-table');const head=node('thead');const hr=node('tr');
  const headings=[{key:'__number',label:'#'},...columns];
  for(const col of headings){const th=node('th');if(col.key==='__number'){th.textContent='#';th.className='rebel-row-number-head';hr.append(th);continue}
   const button=action(col.label,()=>{if(sortKey===col.key)sortDir=sortDir==='asc'?'desc':'asc';else{sortKey=col.key;sortDir='asc'}page=1;draw()},'rebel-sort-button');
   button.setAttribute('aria-label',`Sort ${col.label}`);button.append(node('span',sortKey===col.key?(sortDir==='asc'?' ↑':' ↓'):' ↕','rebel-sort-indicator'));
   if(sortKey===col.key)th.setAttribute('aria-sort',sortDir==='asc'?'ascending':'descending');th.append(button);hr.append(th)}
  if(actions){const th=node('th','Actions');th.className='rebel-actions-heading';hr.append(th)}head.append(hr);table.append(head);
  const body=node('tbody');for(const [offset,{record}] of list.slice((page-1)*size,page*size).entries()){
   const tr=node('tr');const ordinal=node('td',String((page-1)*size+offset+1),'rebel-row-number');ordinal.dataset.label='#';tr.append(ordinal);
   for(const col of columns){const raw=record[col.key];const val=raw==null?'—':Array.isArray(raw)?raw.join(', '):typeof raw==='object'?JSON.stringify(raw):typeof raw==='boolean'?(raw?'Yes':'No'):raw;const td=node('td',val);td.dataset.label=col.label;tr.append(td)}
   if(actions){const cell=node('td',null,'actions');cell.dataset.label='Actions';actions(record,cell,(page-1)*size+offset+1);tr.append(cell)}body.append(tr)
  }table.append(body);wrap.replaceChildren(table);if(!list.length)wrap.append(node('p','No records found.','muted'));
  // Same compact four-button OAACT paginator, with localized labels for Genesis.
  pager.replaceChildren();const limitLabel=node('label','Show ','oaact-page-size'),select=node('select',null,'cv-field-control');select.setAttribute('aria-label','Rows per page');
  for(const n of [5,10,50,100])select.append(new Option(String(n),String(n)));select.value=String(size);select.onchange=()=>{size=Number(select.value);page=1;draw()};limitLabel.append(select,document.createTextNode(' rows'));
  const info=node('span',list.length?`${(page-1)*size+1}–${Math.min(page*size,list.length)} of ${list.length}`:'0 records','oaact-page-info');
  const controls=node('div',null,'oaact-page-buttons');
  for(const [glyph,destination,description] of [['«',1,'First page'],['‹',page-1,'Previous page'],['›',page+1,'Next page'],['»',pages,'Last page']]){
   const button=action(glyph,()=>{page=destination;draw()},'btn btn--ghost');button.title=description;button.setAttribute('aria-label',description);button.disabled=destination<1||destination>pages||destination===page;controls.append(button)
  }
  controls.insertBefore(node('span',`${page} / ${pages}`,'oaact-page-index'),controls.children[2]);pager.append(limitLabel,info,controls);
 }
 input.addEventListener('input',()=>{page=1;draw()});draw();
 return {root,refresh:(rows)=>{items=rows;page=1;draw()},get pageSize(){return size},get currentSort(){return {key:sortKey,direction:sortDir}}};
}

export function renderForm(form,fields,initial={}){for(const d of fields)field(form,d,initial[d.key]);return ()=>values(form,fields)}
export function statusPill(value){const e=node('span',value,'rebel-status');e.dataset.status=String(value||'').toLowerCase().replaceAll(/\W+/g,'-');return e}
