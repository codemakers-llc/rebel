/* CodeView Toast: mensajes no bloqueantes y texto seguro. */
export function createToast({regionId='oaactToastRegion',limit=5}={}){
  const icons={success:'✓',danger:'!',warning:'⚠',info:'i'};
  const show=(message,type='info',duration=4500)=>{
    const region=document.getElementById(regionId);
    if(!region)return;

    // A dialog opened with showModal() lives in the browser's top layer.
    // An ordinary body child cannot appear above it, regardless of z-index.
    const dialogs=[...document.querySelectorAll('dialog[open]')]
      .filter(dialog=>{try{return dialog.matches(':modal');}catch{return false;}});
    const active=dialogs.at(-1);
    if(active){
      if(region.parentElement!==active)active.appendChild(region);
    }else if(region.parentElement!==document.body){
      document.body.appendChild(region);
    }
    region.style.position='fixed';
    region.style.zIndex='2147483645';

    const kind=Object.hasOwn(icons,type)?type:'info';
    const toast=document.createElement('div');
    toast.className='oaact-toast oaact-toast--'+kind;
    toast.setAttribute('role',kind==='danger'?'alert':'status');
    const mark=document.createElement('span');
    mark.className='oaact-toast-icon';
    mark.textContent=icons[kind];
    const text=document.createElement('span');
    text.className='oaact-toast-text';
    text.textContent=String(message);
    let timer=null,remaining=duration,started=0;
    const schedule=()=>{if(remaining>0){started=Date.now();timer=setTimeout(()=>toast.remove(),remaining)}};
    toast.addEventListener('mouseenter',()=>{if(timer!==null){clearTimeout(timer);timer=null;remaining=Math.max(0,remaining-(Date.now()-started))}});
    toast.addEventListener('mouseleave',schedule);
    const dismiss=document.createElement('button');
    dismiss.type='button';
    dismiss.className='oaact-toast-close';
    dismiss.textContent='×';
    dismiss.setAttribute('aria-label','Dismiss notification');
    dismiss.onclick=()=>toast.remove();
    toast.append(mark,text,dismiss);
    region.append(toast);
    while(region.children.length>limit)region.firstElementChild.remove();
    if(active){active.addEventListener('close',()=>{if(region.parentElement===active)document.body.appendChild(region)},{once:true})}
    schedule();
    return toast;
  };
  return Object.freeze({show});
}
/** Keep toast region in topmost modal layer while a dialog is active. */
export function syncToastLayer(regionId='oaactToastRegion'){
 const region=document.getElementById(regionId);
 if(!region)return;
 const dialogs=[...document.querySelectorAll('dialog[open]')].filter(d=>{try{return d.matches(':modal')}catch{return false}});
 const target=dialogs.at(-1)||document.body;
 if(region.parentNode!==target)target.append(region);
 region.style.position='fixed';region.style.zIndex='2147483645';
}
