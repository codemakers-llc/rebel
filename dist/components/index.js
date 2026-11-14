/** Portable frontend widgets for REBEL. Each component receives a host and data; no business APIs. */
export function createKpiWidget(host,{label='',value='—',detail=''}={}){
 const card=document.createElement('section');card.className='metric rebel-widget';
 const number=document.createElement('strong'),caption=document.createElement('small'),hint=document.createElement('small');
 caption.textContent=label;number.textContent=String(value);hint.textContent=detail;
 card.append(number,caption);if(detail)card.append(hint);host.append(card);
 return {root:card,update({value:nextValue,detail:nextDetail}={}){if(nextValue!==undefined)number.textContent=String(nextValue);if(nextDetail!==undefined)hint.textContent=nextDetail},destroy(){card.remove()}};
}
export function createProgressWidget(host,{label='',value=0,max=100}={}){
 const root=document.createElement('div');root.className='telemetry-row rebel-widget';
 const header=document.createElement('div');header.className='telemetry-row-head';
 const title=document.createElement('span');title.textContent=label;
 const count=document.createElement('strong');const track=document.createElement('div');track.className='telemetry-track';
 const bar=document.createElement('i');track.append(bar);header.append(title,count);root.append(header,track);host.append(root);
 function update(next={}){value=next.value??value;max=next.max??max;count.textContent=`${value} / ${max}`;bar.style.width=`${Math.max(0,Math.min(100,max?100*value/max:0))}%`}
 update();return {root,update,destroy(){root.remove()}};
}
/** Map and chart renderers can be registered by consumers without forcing a map/chart dependency. */
export function createComponentLibrary(){const components=new Map();return {
 register(name,renderer){if(typeof name!=='string'||!name.trim()||typeof renderer!=='function')throw Error('Invalid component registration');components.set(name,renderer);return this},
 render(name,host,config){const renderer=components.get(name);if(!renderer)throw Error(`Unknown component: ${name}`);return renderer(host,config)},
 list(){return [...components.keys()]},unregister(name){return components.delete(name)}
};}
