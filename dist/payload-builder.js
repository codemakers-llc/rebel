// Generación de payloads declarativos; no sustituye validaciones del backend.
export function buildPayload(fields,values,{editing=false}={}){
 const result={},errors=[];
 for(const field of fields){if(field.submit===false||(editing&&field.editable===false))continue;
  let v=values[field.name||field.key];if(v==null||v===''){
   if(field.required)errors.push(`${field.label||field.name} es obligatorio`);
   continue;
  }
  if(field.type==='number'||field.type==='status'){v=Number(v);if(!Number.isFinite(v)||(field.type==='status'&&![0,1].includes(v)))errors.push(`Valor numérico inválido: ${field.name}`)}
  if(typeof v==='string'&&field.maxLength&&v.length>field.maxLength)errors.push(`Longitud máxima: ${field.name}`);
  if(field.type==='json'&&typeof v==='string'){try{v=JSON.parse(v)}catch{errors.push(`JSON inválido: ${field.name}`)}}
  result[field.name||field.key]=v;
 }
 return {valid:errors.length===0,data:result,errors};
}
