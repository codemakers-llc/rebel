import {resolveComponent} from './component-registry.js';
import {SimpleStore} from './simple-store.js';
// El motor gestiona suscripciones; cada componente implementa update() y destroy().
export function renderView(container,definition,{store=SimpleStore,api=undefined}={}){
 if(!container||!definition||!Array.isArray(definition.components))throw Error('VIEW_INVALID');
 const cleanups=[];container.replaceChildren();
 for(const config of definition.components){
  const target=document.createElement('section');target.dataset.component=config.type;container.append(target);
  const instance=resolveComponent(config.type)({container:target,config,store,api});
  if(typeof instance?.update!=='function'||typeof instance?.destroy!=='function')throw Error('COMPONENT_CONTRACT_INVALID');
  const sources=[].concat(config.dataSources||config.dataSource||[]);
  const update=()=>instance.update(sources.length===1?store.get(sources[0]):Object.fromEntries(sources.map(k=>[k,store.get(k)])));
  const unsubscribe=sources.map(key=>store.subscribe(key,update));
  cleanups.push(()=>{unsubscribe.forEach(fn=>fn());instance.destroy()});
 }
 return ()=>{cleanups.reverse().forEach(fn=>fn());container.replaceChildren()};
}
