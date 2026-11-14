import {confirmModal} from './modal-manager.js';
import {node,action,section,modal,renderTable} from './proto-ui.js';
const ICONS=['layout-dashboard','clipboard-list','package','database','blocks','panels-top-left','list-tree','palette','activity','shield-check','file-text','folder','settings','users'];
const opts=(select,values,selected)=>{select.replaceChildren();for(const [value,label] of values)select.append(new Option(label,value));if(selected!=null)select.value=String(selected)};
/** Generic navigation CRUD renderer. The consumer owns only REST persistence. */
export async function mountMenuDesigner(host,{api,notify=()=>{},reloadMenu=()=>{}}={}){
 const panel=section(host,'Menu Designer');const tableHost=node('div');panel.append(tableHost);
 let modules=[],views=[],items=[];
 const read=async()=>{const [nav,registered]=await Promise.all([api.request('/api/navigation'),api.request('/api/views')]);modules=nav.modules;items=nav.menuItems;views=registered.views;tableHost.replaceChildren();renderTable(tableHost,{caption:'menu items',items:items.map(i=>({...i,moduleName:modules.find(m=>m.id===i.moduleId)?.name||'—',viewName:views.find(v=>v.route===i.route)?.name||'Unavailable',visibleLabel:i.visible===false?'Hidden':'Visible'})),columns:[{key:'label',label:'Label'},{key:'moduleName',label:'Module'},{key:'viewName',label:'View'},{key:'icon',label:'Icon'},{key:'visibleLabel',label:'Status'}],onNew:()=>edit(null),newLabel:'New Menu Item',actions:(row,cell,rowNumber)=>cell.append(action('Edit',()=>edit(row)),action('Delete',()=>remove(row,rowNumber)))})};
 function edit(item){const {dialog,form}=modal(item?'Edit Menu Item':'New Menu Item');
  const make=(title,kind,value)=>{const label=node('label',title),input=node(kind);if(kind==='input')input.value=value??'';label.append(input);form.append(label);return input};
  const label=make('Menu Label','input',item?.label||''),module=make('Module','select'),view=make('Registered View','select'),icon=make('Icon','select'),order=make('Order','input',item?.order??(items.length+1)),visible=make('Visible in menu','input');order.type='number';visible.type='checkbox';visible.checked=item?.visible!==false;visible.classList.add('rebel-switch-input');visible.setAttribute('role','switch');visible.parentElement.classList.add('rebel-switch-field');
  opts(module,modules.map(m=>[m.id,m.name]),item?.moduleId);opts(view,views.map(v=>[v.route,v.name+' ('+v.route+')']),item?.route);opts(icon,ICONS.map(i=>[i,i]),item?.icon||'package');
  const preview=node('div',null,'muted');preview.textContent='Icon: '+icon.value;icon.onchange=()=>preview.textContent='Icon: '+icon.value;form.append(preview);
  const bar=node('div',null,'toolbar');bar.append(action('Cancel',()=>dialog.close()),action('Save Item',async()=>{try{if(!label.value.trim())throw Error('Menu label is required');await api.request('/api/navigation/items'+(item?'/'+item.id:''),{method:item?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({label:label.value.trim(),moduleId:Number(module.value),route:view.value,icon:icon.value,order:Number(order.value)||1,visible:visible.checked})});dialog.close();await read();await reloadMenu();notify('Menu updated')}catch(e){notify(e.message,true)}},'btn btn--primary'));form.append(bar);
 }
 async function remove(item,rowNumber){if(!await confirmModal(`Are you sure you want to delete record #${rowNumber}? The registered view will remain available.`))return;try{await api.request('/api/navigation/items/'+item.id,{method:'DELETE'});await read();await reloadMenu();notify('Menu item removed')}catch(e){notify(e.message,true)}}
 await read();
}
