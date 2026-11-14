// Generic read-only views: declarative components and a single active view lifecycle.
const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=String(text);if(cls)node.className=cls;return node};
const normalizeCols=cols=>(cols||[]).map(c=>typeof c==='string'?{field:c,label:c}:{field:c.field||c.key,label:c.label||c.field});
export function createCustomViewRenderer({request=async()=>({items:[]}),toast}={}){
 let epoch=0,controller=null;
 async function open(host,view,{sample=false}={}){
  const current=++epoch;controller?.abort();controller=new AbortController();host.replaceChildren();
  const layout=el('div',undefined,'cv-custom-layout');host.append(layout);
  const components=view.components?.length?view.components:[...((view.columns?.length)?[{type:'table',source:view.endpoint,columns:view.columns}]:[])];
  // Load only one request per distinct endpoint; multiple tables can share the same data.
  const sources=[...new Set(components.filter(c=>c.type==='table'&&c.source).map(c=>c.source))];
  let datasets={};
  if(!sample){
   const responses=await Promise.allSettled(sources.map(src=>request(src,{signal:controller.signal})));
   if(current!==epoch)return;
   sources.forEach((src,i)=>{if(responses[i].status==='fulfilled')datasets[src]=responses[i].value?.items||responses[i].value||[];else toast?.show('Could not load '+src,'danger')});
  }
  for(const c of components){
   if(current!==epoch)return;
   const box=el('section',undefined,'cv-custom-component');layout.append(box);
   if(c.type==='card'||c.type==='kpi'){box.append(el('h3',c.title||'Overview'),el('p',c.text||'—'));continue}
   if(c.type==='heading'){box.append(el('h3',c.title||view.title));continue}
   if(c.type==='table'){
    const cols=normalizeCols(c.columns?.length?c.columns:view.columns);
    const records=sample?[Object.fromEntries(cols.map(x=>[x.field,'Example']))]:(Array.isArray(datasets[c.source])?datasets[c.source]:[]);
    let filtered=records.slice(),page=1;const pageSize=Math.max(1,Math.min(100,c.pagination?.pageSize||view.pageSize||20));
    if(c.search){const search=el('input');search.type='search';search.placeholder='Search…';search.className='cv-field-control';box.append(search);search.oninput=()=>{filtered=records.filter(row=>Object.values(row).some(value=>String(value??'').toLowerCase().includes(search.value.toLowerCase())));page=1;draw()}}
    const table=el('table',undefined,'admin-table cv-generic-table'),nav=el('nav',undefined,'cv-table-pagination');box.append(table,nav);
    function draw(){table.replaceChildren();nav.replaceChildren();const head=el('thead'),tr=el('tr');cols.forEach(col=>tr.append(el('th',col.label)));head.append(tr);table.append(head);const body=el('tbody');
     for(const record of filtered.slice((page-1)*pageSize,page*pageSize)){const row=el('tr');cols.forEach(col=>{const cell=el('td',record[col.field]??'—');cell.dataset.label=col.label;row.append(cell)});body.append(row)}table.append(body);
     const pages=Math.max(1,Math.ceil(filtered.length/pageSize));const prev=el('button','Previous','btn btn--ghost'),next=el('button','Next','btn btn--ghost');prev.disabled=page<=1;next.disabled=page>=pages;prev.onclick=()=>{page--;draw()};next.onclick=()=>{page++;draw()};nav.append(prev,el('span',`Page ${page} of ${pages}`),next);
    }draw();continue;
   }
   if(c.type==='modal'){
    const openButton=el('button',c.label||'Open form','btn btn--primary');box.append(openButton);
    openButton.onclick=()=>{
     const modal=el('dialog',undefined,'oaact-crud-dialog cv-interactive-dialog');const header=el('div',undefined,'cv-full-head');
     header.append(el('h3',c.title||'Form'),el('button','Close','btn btn--ghost'));
     header.lastChild.type='button';header.lastChild.onclick=()=>modal.close();modal.append(header);
     const content=el('form',undefined,'cv-form-grid');const n=Number(c.columns||view.layout?.columns||2);
     content.style.setProperty('--cv-form-cols',String([1,2,3,4].includes(n)?n:2));
     for(const f of c.fields||view.fields||[]){const label=el('label',f.label||f.key);let input;
      if(f.type==='select'){input=el('select');for(const opt of f.options||[])input.append(new Option(opt.label||opt.value,opt.value))}
      else if(['textarea','textlong'].includes(f.type)){input=el('textarea')}
      else{input=el('input');input.type=['number','date','email','checkbox','time','datetime-local'].includes(f.type)?f.type:'text'}
      input.name=f.key;input.required=!!f.required;if(f.maxLength)input.maxLength=f.maxLength;if(f.minLength)input.minLength=f.minLength;if(f.pattern)input.pattern=f.pattern;
      label.append(input);content.append(label);
     }
     const footer=el('div',undefined,'cv-modal-actions');const showPayload=el('button','Generate JSON','btn btn--primary');showPayload.type='submit';
     const close=el('button','Cancel','btn btn--ghost');close.type='button';close.onclick=()=>modal.close();footer.append(close,showPayload);
     content.append(footer);const payload=el('pre',undefined,'cv-payload');payload.hidden=true;
     content.onsubmit=e=>{e.preventDefault();if(!content.reportValidity())return;
      const data={};for(const f of c.fields||view.fields||[]){const element=content.elements.namedItem(f.key);data[f.key]=element?.type==='checkbox'?element.checked:element?.value??''}
      payload.textContent=JSON.stringify(data,null,2);payload.hidden=false;
     };
     modal.append(content,payload);
     for(const sub of c.submodals||[]){const subButton=el('button',sub.label||'Open submodal','btn btn--ghost');subButton.type='button';
      subButton.onclick=()=>{const child=el('dialog',undefined,'oaact-crud-dialog cv-interactive-dialog');child.append(el('h3',sub.title||'Submodal'),el('p',sub.text||'Confirmation window'));const btn=el('button','Close','btn btn--ghost');btn.onclick=()=>child.close();child.append(btn);document.body.append(child);child.addEventListener('close',()=>child.remove(),{once:true});child.showModal()};
      modal.append(subButton)
     }
     document.body.append(modal);modal.addEventListener('close',()=>modal.remove(),{once:true});modal.showModal();
    };continue;
   }
   if(c.type==='form'){const form=el('form',undefined,'cv-form-grid');form.style.setProperty('--cv-form-cols',String([1,2,3,4].includes(c.columns)?c.columns:2));
    for(const f of view.fields||[]){const lab=el('label',f.label||f.key);const input=['textarea','text'].includes(f.type)&&f.type==='textarea'?el('textarea'):el(f.type==='select'?'select':'input');
     if(input.tagName==='INPUT')input.type=['number','date','email','checkbox'].includes(f.type)?f.type:'text';
     if(input.tagName==='SELECT')for(const option of f.options||[])input.append(new Option(option.label||option.value,option.value));
     input.required=!!f.required;if(f.maxLength)input.maxLength=f.maxLength;lab.append(input);form.append(lab)}form.onsubmit=e=>e.preventDefault();box.append(form);continue;
   }
   box.append(el('p','Specialized component: '+c.type));
  }
 }
 function destroy(){epoch++;controller?.abort()}
 return {open,destroy};
}
