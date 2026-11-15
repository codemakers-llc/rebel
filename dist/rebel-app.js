import { createCustomViewRenderer } from './custom-view.js';
import { createApiClient } from './api-client.js';
/** Feature definitions live in frontend/features/*.js; no database is required for views. */
export function defineView(definition) {
  if (!definition || typeof definition.title !== 'string' || !Array.isArray(definition.components)) throw Error('REBEL_VIEW_INVALID');
  return definition;
}
export function createRebelApp({ host, outlet, routes, fetchImpl = globalThis.fetch, onError = console.error } = {}) {
  if (!host || !outlet || !routes || typeof routes !== 'object') throw Error('REBEL_APP_INVALID');
  const api = createApiClient({fetchImpl,minDelayMs:Number(globalThis.REBEL_PROTO_DELAY_MS||0)});
  const viewer = createCustomViewRenderer({request: (url, options) => api.request(url, options)});
  let currentCleanup = null, generation = 0;
  async function navigate(path, {replace = false} = {}) {
    const target = routes[path];
    if (!target) { onError(Error('View not found: '+path)); return; }
    const current = ++generation;
    // Every navigation releases transient overlays from the previous feature.
    for (const dialog of document.querySelectorAll('dialog[open]')) { try { dialog.close(); } catch {} }
    document.querySelectorAll('dialog:not([open])').forEach(dialog => { if (dialog.parentElement === document.body) dialog.remove(); });
    // Never clear the visible screen during import/API work: prevent the white flash.
    const stage = document.createElement('div');
    stage.className = 'rebel-view-stage';
    let pendingCleanup = null;
    try {
      const imported = await target();
      if (current !== generation) return;
      const view = defineView(imported.default ?? imported);
      await viewer.open(stage, view);
      if (current !== generation) return;
      if (typeof view.onMount === 'function') {
        const cleanup = await view.onMount({host:stage,api,refresh:()=>navigate(path,{replace:true}),navigate});
        if (typeof cleanup === 'function') pendingCleanup = cleanup;
      }
      if (current !== generation) {pendingCleanup?.();return;}
      currentCleanup?.(); currentCleanup = pendingCleanup;
      const title = host.querySelector('[data-rebel-title]');
      if (title) title.textContent = view.title;
      outlet.replaceChildren(...stage.childNodes);
      // Prevent history changes before the destination is actually visible.
      if (replace) history.replaceState({}, '', path);
      else if (location.pathname !== path) history.pushState({}, '', path);
      host.dispatchEvent(new CustomEvent('rebel:navigated',{detail:{path}}));
    } catch(error) {if (current === generation) {pendingCleanup?.();onError(error);}}
  }
  function linkHandler(event) {
    const anchor = event.target.closest('a[data-rebel-link]');
    if (!anchor || !host.contains(anchor) || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigate(new URL(anchor.href).pathname);
  }
  // A route restored through browser history must never bypass the demo landing.
  const popHandler=()=>{if(outlet.closest('#app')?.classList.contains('rebel-landing-mode'))return; navigate(location.pathname,{replace:true})};
  host.addEventListener('click',linkHandler);
  window.addEventListener('popstate',popHandler);
  function suspend(){generation++;currentCleanup?.();currentCleanup=null;viewer.destroy();}
  function destroy(){suspend();host.removeEventListener('click',linkHandler);window.removeEventListener('popstate',popHandler);}
  return Object.freeze({navigate,suspend,start:()=>navigate(routes[location.pathname]?location.pathname:Object.keys(routes)[0],{replace:true}),destroy,api});
}
