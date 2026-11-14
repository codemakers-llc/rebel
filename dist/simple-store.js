// CodeView SimpleStore: estado local observable por recurso.
export function createStore(){
 const values=new Map(),listeners=new Map(),pending=new Map(),invalid=new Set();
 const notify=key=>{for(const listener of listeners.get(key)||[])listener(values.get(key))};
 return Object.freeze({
  get:key=>values.get(key),
  set(key,value){values.set(key,value);invalid.delete(key);notify(key);return value},
  subscribe(key,listener){if(!listeners.has(key))listeners.set(key,new Set());listeners.get(key).add(listener);if(values.has(key))listener(values.get(key));return ()=>{listeners.get(key)?.delete(listener)}},
  upsert(key,row,idKey='id'){const v=values.get(key)||[];if(!Array.isArray(v))throw Error('NOT_ARRAY');const index=v.findIndex(x=>x[idKey]===row[idKey]);const result=[...v];if(index<0)result.unshift(row);else result[index]={...result[index],...row};values.set(key,result);notify(key)},
  remove(key,id,idKey='id'){const v=values.get(key)||[];values.set(key,v.filter(x=>x[idKey]!==id));notify(key)},
  invalidate(key){invalid.add(key)},
  async ensure(key,loader){if(values.has(key)&&!invalid.has(key))return values.get(key);if(pending.has(key))return pending.get(key);const task=Promise.resolve().then(loader).then(value=>{values.set(key,value);invalid.delete(key);notify(key);return value}).finally(()=>pending.delete(key));pending.set(key,task);return task},
  clear(){values.clear();invalid.clear();pending.clear();listeners.clear()}
 });
}
export const SimpleStore=createStore();
