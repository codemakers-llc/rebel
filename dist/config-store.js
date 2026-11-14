/** REBEL ConfigStore: immutable snapshots + fast lookups, independent of backend. */
export function createConfigStore() {
 let state=null;
 const subscribers=new Set();
 const copy=value=>typeof structuredClone==='function'?structuredClone(value):JSON.parse(JSON.stringify(value));
 function load(payload){
  if(!payload||!Array.isArray(payload.views)||!Array.isArray(payload.modules)||!Array.isArray(payload.menuItems))throw Error('REBEL_BOOTSTRAP_INVALID');
  const views=new Map(),routes=new Map();
  for(const candidate of payload.views){
   if(!candidate||typeof candidate.route!=='string'||typeof candidate.file!=='string'||!candidate.route.startsWith('/')||routes.has(candidate.route))throw Error('REBEL_BOOTSTRAP_VIEW_INVALID');
   const view=copy(candidate);views.set(candidate.file,view);routes.set(candidate.route,view);
  }
  state={version:payload.version||1,role:payload.role||null,views,routes,modules:copy(payload.modules),menuItems:copy(payload.menuItems),theme:copy(payload.theme||{})};
  subscribers.forEach(listener=>listener(state));return state;
 }
 function patchTheme(theme){if(!state)throw Error('REBEL_CONFIG_NOT_LOADED');state.theme=copy(theme);subscribers.forEach(listener=>listener(state));return state.theme;}
 function subscribe(listener){subscribers.add(listener);return()=>subscribers.delete(listener)}
 return Object.freeze({load,patchTheme,subscribe,get current(){return state},getViewByRoute:route=>state?.routes.get(route)||null,getViewByFile:file=>state?.views.get(file)||null,getViews:()=>[...(state?.views.values()||[])],getModules:()=>state?.modules||[],getMenu:()=>state?.menuItems||[],getTheme:()=>state?.theme||null});
}
