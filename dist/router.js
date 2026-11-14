/** Shared route identity for web (History API) and Cordova (hash routes).
 * This module never loads views or grants access; the application supplies onNavigate.
 */
const cleanRoute = route => {
 if (typeof route !== 'string' || !/^\/(?:admin|app)(?:\/[a-zA-Z0-9_:-]+)*\/?$/.test(route) || route.includes('..') || route.includes('//')) throw Error('ROUTE_INVALID');
 return route.replace(/\/$/, '') || '/';
};
export function createViewRouter({history,location,onNavigate,base='/admin',mode='history',isCordova=false}={}) {
 if(!history||!location||typeof onNavigate!=='function')throw Error('ROUTER_CONFIG_REQUIRED');
 if(!['history','hash','auto'].includes(mode))throw Error('ROUTER_MODE_INVALID');
 const selected=mode==='auto'?(isCordova?'hash':'history'):mode;
 function current(){
  const route=selected==='hash'?(location.hash||'').replace(/^#/,''):location.pathname;
  return cleanRoute(!route || route===base?base+'/dashboard':route);
 }
 function navigate(route,{replace=false,fromHistory=false}={}) {
  route=cleanRoute(route);
  if(!fromHistory){
   const fn=replace?'replaceState':'pushState';
   history[fn]({cvRoute:true},'',selected==='hash'?'#'+route:route);
  }
  return onNavigate(route);
 }
 // Caller wires popstate on web and hashchange on Cordova; no duplicate handlers.
 return Object.freeze({navigate,current,mode:selected,event:selected==='hash'?'hashchange':'popstate'});
}
