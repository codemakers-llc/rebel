// Declarative view templates. No executable code is stored in view configurations.
const clean=(v,fallback='vista')=>String(v||fallback).trim().toLowerCase().replace(/[^a-z0-9_-]/g,'_').slice(0,80);
const label=v=>String(v||'Vista').replace(/[_-]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
export const VIEW_TYPES=Object.freeze(['crud','table','custom']);
export function viewTemplate(type,{key='vista',title,model,source,fields=[]}={}){
 if(!VIEW_TYPES.includes(type))throw Error('VIEW_TYPE_INVALID');
 key=clean(key);title=title||label(key);
 const columns=fields.map(f=>typeof f==='string'?f:f.name).filter(Boolean);
 const normalized=fields.filter(f=>typeof f==='string'||!(f.primaryKey||f.autoIncrement||f.readOnly)).map(f=>typeof f==='string'?{key:f,label:label(f),type:'text'}:{key:f.name,label:label(f.label||f.name),type:f.type==='string'?'text':f.type==='text'?'textarea':f.type==='boolean'?'checkbox':f.type==='integer'||f.type==='decimal'?'number':f.type||'text',maxLength:f.maxLength||f.length,required:typeof f.required==='boolean'?f.required:!f.nullable,pattern:f.pattern,options:f.options}).filter(f=>f.key);
 const base={title,type,route:'/app/'+key,fields:normalized,columns,actions:[],pageSize:20,layout:{columns:'auto'},components:[]};
 if(type==='crud')return {...base,model:model||key,endpoint:source||'/api/'+key,actions:['create','edit'],form:'modal'};
 if(type==='table')return {...base,type:'table',endpoint:source||'/api/'+key,readOnly:true,components:[{type:'table',source:source||'/api/'+key,columns,search:true,pagination:{mode:'memory',pageSize:20}}]};
 return {...base,type:'custom',fields:[{key:'nombre',label:'Nombre',type:'text'},{key:'estado',label:'Estado',type:'select',options:[{value:'activo',label:'Activo'},{value:'inactivo',label:'Inactivo'}]},{key:'fecha',label:'Fecha',type:'date'},{key:'descripcion',label:'Descripción',type:'textarea'}],columns:[],components:[{type:'form',columns:2},{type:'card',title:'Resumen'},{type:'table',columns:[],rows:[]},{type:'modal',label:'Abrir formulario',title:'Formulario de ejemplo',columns:2,submodals:[{label:'Confirmar',title:'Confirmación',text:'Esta acción solo es una demostración.'}]}]};
}
export function validateViewDefinition(v){
 if(!v||typeof v!=='object'||Array.isArray(v)||typeof v.title!=='string'||!v.title.trim())throw Error('VIEW_TITLE_REQUIRED');
 if(!['crud','table','custom'].includes(v.type||'crud'))throw Error('VIEW_TYPE_INVALID');
 if(!Array.isArray(v.fields)||!Array.isArray(v.columns))throw Error('VIEW_FIELDS_COLUMNS_REQUIRED');
 if(v.route!==undefined&&(!/^\/(admin|app)\/[a-z0-9_/-]+$/i.test(v.route)||v.route.includes('//')||v.route.includes('..')))throw Error('VIEW_ROUTE_INVALID');
 if(v.endpoint!==undefined&&(!/^\/api\/[a-z0-9_/-]+$/i.test(v.endpoint)||v.endpoint.includes('//')))throw Error('VIEW_ENDPOINT_INVALID');
 if(v.components!==undefined&&(!Array.isArray(v.components)||v.components.length>150))throw Error('VIEW_COMPONENTS_INVALID');
 if(JSON.stringify(v).length>65536)throw Error('VIEW_TOO_LARGE');
 return v;
}
