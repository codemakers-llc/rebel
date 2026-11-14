import {confirmModal} from './modal-manager.js';
import {modal as rebelModal,renderForm as rebelForm,renderTable as rebelTable} from './proto-ui.js';

const element=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
function makeDialog(title,fields,values={},submitLabel='Save'){
 const {dialog,form}=rebelModal(title);form.classList.add('request-form');
 rebelForm(form,fields,values);
 const actions=element('div','toolbar');const fill=element('button','btn btn--ghost','Fill with Demo Data');fill.type='button';fill.onclick=()=>{const samples=[{title:'Replace office Wi-Fi access point',description:'The meeting room access point intermittently disconnects. Please replace it and confirm coverage.',category:'Network',priority:'High',requesterEmail:'technician@example.test',dueDate:'2026-12-15',estimatedCost:'250',urgent:true},{title:'Schedule security camera maintenance',description:'Inspect and replace intermittent recording unit in the lobby. Include a technician report.',category:'Hardware',priority:'Normal',requesterEmail:'facilities@example.test',dueDate:'2026-12-20',estimatedCost:'480',urgent:false},{title:'Renew workstation software licenses',description:'Renew licenses for the operations team and verify activation before the renewal deadline.',category:'Software',priority:'Low',requesterEmail:'operations@example.test',dueDate:'2027-01-10',estimatedCost:'990',urgent:false}];const fake=samples[Math.floor(Math.random()*samples.length)];for(const [key,val] of Object.entries(fake)){const e=form.elements.namedItem(key);if(e){if(e.type==='checkbox')e.checked=!!val;else e.value=val;}}};const cancel=element('button','btn btn--ghost','Cancel');cancel.type='button';cancel.onclick=()=>dialog.close();const save=element('button','btn btn--primary',submitLabel);save.type='submit';actions.append(fill,cancel,save);form.append(actions);return {dialog,form};
}
export function createRequestWorkflowView({mode='submission',fields=[],loadFields=null,title}={}){return {title:mode==='submission'?'Request Submission':'Request Evaluation',type:'crud',endpoint:'/api/requests',fields,components:[],async onMount({host,api,refresh}){
const section=element('section','panel');const tableHost=element('div');const status=element('p','inline-status');status.setAttribute('role','status');section.append(tableHost,status);host.append(section);
 let active=true;
 let rows=(await api.request('/api/requests')).items||[];
 const activeFields=typeof loadFields==='function'?await loadFields(api):fields;
 const notify=(message,error=false)=>{status.textContent=message;status.style.color=error?'#d45353':'';window.rebelDemo?.notify(message,error)};
 async function invoke(url,method='POST',body){try{await api.request(url,{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});notify('Changes saved successfully');await refresh();}catch(e){notify(e.message,true);}}
 async function editRequest(row){
  // Read the current version from the backend, not a potentially stale table snapshot.
  let source=row;
  if(row){try{source=await api.request('/api/requests/'+row.id)}catch(e){if(active)notify(e.message,true);return}}
  if(!active)return;
  const {dialog,form}=makeDialog(source?'Edit Request #'+source.id:'New Request',activeFields,source||{},'Submit');
  const submitButton=form.querySelector('button[type=submit]');
  let working=false;
  form.onsubmit=async e=>{
   e.preventDefault();
   if(working||!form.reportValidity())return;
   working=true;submitButton.disabled=true;
   const payload=Object.fromEntries(new FormData(form));
   payload.urgent=form.elements.namedItem('urgent')?.checked??false;
   // A single atomic API operation persists the latest values and submits the request.
   payload.submit=true;
   try{
    const saved=await api.request(source?'/api/requests/'+source.id:'/api/requests',{method:source?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    dialog.close();
    if(active){notify('Request #'+saved.id+' submitted for review');await refresh();}
   }catch(error){notify(error.message,true);working=false;submitButton.disabled=false;}
  };
 }
 async function review(row){
  try{row=await api.request('/api/requests/'+row.id)}catch(e){notify(e.message,true);return}
  if(!active)return;
  if(!['Pending Review','Changes Requested'].includes(row.status)){
   notify('Only pending or rejected requests can be evaluated',true);
   await refresh();return;
  }
  const {dialog,form}=makeDialog('Evaluate Request #'+row.id,[
   {key:'decision',label:'Decision',type:'select',required:true,options:[{value:'approve',label:'Approve'},{value:'reject',label:'Reject'}]},
   {key:'feedback',label:'Observations',type:'text'}
  ],{decision:'approve',feedback:''},'Save Evaluation');
  const summary=element('div','rebel-review-summary');summary.append(element('h4','','Request Information'));
  const reviewGrid=element('div','rebel-request-detail-grid');
  for(const [label,value] of [['Title',row.title],['Description',row.description],['Category',row.category||'—'],['Priority',row.priority]]){
   const item=element('div','rebel-request-detail-item');item.append(element('span','rebel-request-detail-label',label),element('strong','rebel-request-detail-value',String(value??'—')));reviewGrid.append(item);
  }
  summary.append(reviewGrid);
  form.prepend(summary);
  const decision=form.elements.namedItem('decision'),feedback=form.elements.namedItem('feedback');
  const syncRequired=()=>{feedback.setCustomValidity('');feedback.required=decision.value==='reject';feedback.closest('label').classList.toggle('rebel-field-required',feedback.required)};
  decision.addEventListener('change',syncRequired);syncRequired();
  const fill=form.querySelector('.toolbar button');if(fill)fill.remove();
  form.onsubmit=async e=>{
   e.preventDefault();syncRequired();if(!form.reportValidity())return;
   const notes=feedback.value.trim();if(decision.value==='reject'&&!notes){feedback.setCustomValidity('Observations are required when rejecting');feedback.reportValidity();return}feedback.setCustomValidity('');
   const submit=form.querySelector('button[type=submit]');submit.disabled=true;
   try{await api.request('/api/requests/'+row.id+'/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({decision:decision.value,feedback:notes})});dialog.close();if(active){notify(decision.value==='reject'?'Request returned for changes':'Request approved');await refresh()}}
   catch(error){notify(error.message,true);submit.disabled=false}
  };
  feedback.addEventListener('input',()=>feedback.setCustomValidity(''));
 }
 function details(row){
  const dialog=element('dialog','proto-dialog rebel-request-details');dialog.append(element('h3','',`Request #${row.id}`));
  const grid=element('div','rebel-request-detail-grid');
  for(const [label,value] of [['Title',row.title],['Description',row.description],['Category',row.category||'—'],['Priority',row.priority],['Status',row.status],['Score',row.score??'—'],['Requested by',row.requesterEmail||'—'],['Due',row.dueDate||'—'],['Estimated cost','$'+(row.estimatedCost??0)],['Urgent',row.urgent?'Yes':'No']]){
   const item=element('div','rebel-request-detail-item');item.append(element('span','rebel-request-detail-label',label),element('strong','rebel-request-detail-value',String(value)));grid.append(item)
  }
  dialog.append(grid,element('h4','rebel-detail-timeline-heading','Request Timeline'));
  const history=element('ol','rebel-detail-timeline');for(const h of row.history||[]){const li=element('li');li.append(element('strong','',h.action),element('span','',`${h.by} · ${new Date(h.at).toLocaleString()}`));if(h.feedback)li.append(element('p','',h.feedback));history.append(li)}dialog.append(history);
  const actions=element('div','toolbar rebel-modal-actions');const close=element('button','btn btn--ghost','Close');close.type='button';close.onclick=()=>dialog.close();actions.append(close);dialog.append(actions);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();
 }
 function action(row,label,callback){const b=element('button','btn btn--ghost',label);b.onclick=callback;return b;}
 const draw=()=>{
  tableHost.replaceChildren();
  rebelTable(tableHost,{
   caption:'requests',items:rows,pageSize:5,
   columns:[{key:'id',label:'ID'},{key:'title',label:'Title'},{key:'priority',label:'Priority'},{key:'status',label:'Status'}],
   onNew:mode==='submission'?()=>editRequest():null,
   newLabel:'New Request',
   actions:(row,cell)=>{
    cell.append(action(row,'View',()=>details(row)));
    if(mode==='submission'&&['Draft','Changes Requested'].includes(row.status)){
      cell.append(action(row,'Edit',()=>editRequest(row)));
      if(row.status==='Draft')cell.append(action(row,'Delete',async()=>{if(await confirmModal('Delete this draft? This action cannot be undone.'))invoke('/api/requests/'+row.id,'DELETE')}));
    }
    if(mode==='evaluation'&&['Pending Review','Changes Requested'].includes(row.status))cell.append(action(row,'Review',()=>review(row)));
   }
  });
 };
 draw();
 return ()=>{active=false;};
}};}

