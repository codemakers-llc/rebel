/** REBEL dashboard composition; widgets and data belong to the consumer app.
 * Load on entry and refresh only on explicit user action. Each widget may return a
 * disposer for local animation/simulation; never poll the API by default.
 */
export function createWidgetDashboardView({title='Dashboard',description='',widgets=[],loadData}={}){
 if(typeof loadData!=='function'||!Array.isArray(widgets))throw Error('REBEL_WIDGET_CONFIG_INVALID');
 return {title,components:[],async onMount({host,api,navigate}){
  const root=document.createElement('div');root.className='rebel-widget-dashboard';
  const heading=document.createElement('div');heading.className='rebel-widget-heading';
  const intro=document.createElement('div');intro.className='rebel-widget-intro';
  const h=document.createElement('h2');h.textContent=title;
  const p=document.createElement('p');p.textContent=description;
  intro.append(h,p);heading.append(intro);
  const controls=document.createElement('div');controls.className='rebel-widget-controls';
  const meta=document.createElement('span');meta.className='rebel-widget-refresh';meta.setAttribute('role','status');meta.textContent='Loading…';
  const refreshButton=document.createElement('button');refreshButton.type='button';refreshButton.className='rebel-widget-reload';refreshButton.textContent='↻ Refresh';refreshButton.setAttribute('aria-label','Refresh dashboard data');
  controls.append(meta,refreshButton);heading.append(controls);root.append(heading);
  const grid=document.createElement('div');grid.className='rebel-widget-grid';root.append(grid);
  const slots=widgets.map(widget=>{const card=document.createElement('section');card.className='rebel-widget-card '+(widget.size==='wide'?'rebel-widget-wide':'');card.dataset.widget=widget.id;const head=document.createElement('h3');head.textContent=widget.title;const body=document.createElement('div');body.className='rebel-widget-body';card.append(head,body);grid.append(card);return {widget,body,cleanup:null}});
  host.append(root);let alive=true,busy=false;
  const refresh=async()=>{if(busy||!alive)return;busy=true;refreshButton.disabled=true;refreshButton.setAttribute('aria-busy','true');meta.textContent='Loading…';
   try{const data=await loadData(api);if(!alive)return;
    for(const slot of slots){try{slot.cleanup?.();slot.cleanup=null;const result=await slot.widget.render(slot.body,{data,navigate,api});if(typeof result==='function')slot.cleanup=result}catch(err){slot.body.textContent='Widget unavailable: '+err.message}}
    meta.textContent='Updated '+new Date().toLocaleTimeString()+' · manual refresh';
   }catch(err){if(alive)meta.textContent='Connection issue: '+err.message}
   finally{busy=false;if(alive){refreshButton.disabled=false;refreshButton.removeAttribute('aria-busy')}}
  };
  refreshButton.addEventListener('click',refresh);
  await refresh();
  return ()=>{alive=false;refreshButton.removeEventListener('click',refresh);for(const slot of slots){slot.cleanup?.();slot.cleanup=null}};
 }};
}
