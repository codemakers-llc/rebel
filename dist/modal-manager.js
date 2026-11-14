import {syncToastLayer} from './toast.js';
/** REBEL modal lifecycle. Works with native <dialog> and preserves browser focus handling. */
let observing=false;
export function enhanceModal(dialog,{closeOnBackdrop=true}={}){
 if(!dialog || dialog.dataset.rebelModalEnhanced==='true')return dialog;
 dialog.dataset.rebelModalEnhanced='true';
 const heading=dialog.querySelector('h3, h2, [data-modal-title]');
 if(heading){
  let head=heading.closest('.rebel-modal-header, .oaact-dialog-head, .cv-full-head');
  if(!head){head=document.createElement('div');head.className='rebel-modal-header';heading.parentNode.insertBefore(head,heading);head.append(heading)}
  if(!head.querySelector('[data-rebel-close]') && !head.querySelector('#crudClose')){
   const close=document.createElement('button');close.type='button';close.className='rebel-modal-close';close.dataset.rebelClose='';close.setAttribute('aria-label','Close dialog');close.textContent='×';close.addEventListener('click',()=>dialog.close());head.append(close);
  }
 }
 if(closeOnBackdrop){
  // Clicks on a dialog's backdrop target the dialog itself, outside its bounding box.
  dialog.addEventListener('click',event=>{
   if(event.target!==dialog)return;
   const bounds=dialog.getBoundingClientRect();
   if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();
  });
 }
 return dialog;
}
export function initModalManager(){
 if(observing||typeof document==='undefined')return;
 observing=true;
 const scan=()=>{for(const dialog of document.querySelectorAll('dialog[open]'))enhanceModal(dialog);syncToastLayer()};
 const watcher=new MutationObserver(scan);
 watcher.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['open']});
 scan();
}
/** Asynchronous, accessible replacement for window.confirm. */
export function confirmModal(message,{title='Confirm deletion',confirmText='Delete',cancelText='Cancel',danger=true}={}){
 return new Promise(resolve=>{
  const dialog=document.createElement('dialog');dialog.className='proto-dialog oaact-crud-dialog rebel-confirm-dialog';
  const heading=document.createElement('h3');heading.textContent=title;
  const description=document.createElement('p');description.className='rebel-confirm-message';description.textContent=message;
  const bar=document.createElement('div');bar.className='toolbar rebel-modal-actions';
  const cancel=document.createElement('button');cancel.type='button';cancel.className='btn btn--ghost';cancel.textContent=cancelText;
  const accept=document.createElement('button');accept.type='button';accept.className=danger?'btn btn--danger':'btn btn--primary';accept.textContent=confirmText;
  const done=value=>{dialog.dataset.confirmed=value?'true':'false';dialog.close()};
  cancel.addEventListener('click',()=>done(false));accept.addEventListener('click',()=>done(true));
  bar.append(cancel,accept);dialog.append(heading,description,bar);
  enhanceModal(dialog);
  dialog.addEventListener('close',()=>{const success=dialog.dataset.confirmed==='true';dialog.remove();resolve(success)},{once:true});
  document.body.append(dialog);dialog.showModal();cancel.focus();
 });
}
