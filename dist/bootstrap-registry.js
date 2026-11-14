/** Single published-view registry for web and Cordova. All definitions are data. */
export function createBootstrapRegistry(){
 let value=null;
 const listeners=new Set();
 function load(data){
  if(!data||typeof data!=='object'||Array.isArray(data)||!data.views||typeof data.views!=='object'||Array.isArray(data.views))throw Error('BOOTSTRAP_INVALID');
  const views=new Map(),routes=new Map();
  for(const [key,def] of Object.entries(data.views)){
   if(!/^[a-z][a-z0-9_-]{1,79}$/.test(key)||!def||typeof def!=='object'||Array.isArray(def))throw Error('BOOTSTRAP_VIEW_INVALID');
   const route=def.route;
   if(typeof route!=='string'||!/^\/(admin|app)\/[a-zA-Z0-9_/-]+$/.test(route)||route.includes('//')||route.includes('..'))throw Error('BOOTSTRAP_ROUTE_INVALID');
   if(routes.has(route))throw Error('BOOTSTRAP_DUPLICATE_ROUTE');
   views.set(key,structuredClone(def));routes.set(route,key);
  }
  value={views,routes,menu:structuredClone(data.menu||data.modules||[]),theme:structuredClone(data.theme||null),version:data.version||null};
  for(const listener of listeners)listener(value);
  return value;
 }
 function getView(key){return value?.views.get(key)}
 function getKeyForRoute(route){return value?.routes.get(route)}
 function subscribe(fn){if(typeof fn!=='function')throw Error('BOOTSTRAP_LISTENER_INVALID');listeners.add(fn);return()=>listeners.delete(fn)}
 function reset(){value=null;for(const listener of listeners)listener(null)}
 return Object.freeze({load,getView,getKeyForRoute,subscribe,reset,get current(){return value}});
}
