/** Generic fetch client with optional visual loading hooks. */
export function createApiClient({fetchImpl=globalThis.fetch,credentials='same-origin',onBegin=()=>{},onFinish=()=>{},minDelayMs=0}={}) {
  // One counter per application, not one loader per request. Only the last request hides it.
  const begin=()=>{onBegin();if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('rebel:request-start'))};
  const finish=()=>{onFinish();if(typeof document!=='undefined')document.dispatchEvent(new CustomEvent('rebel:request-end'))};
  const hold=async(start)=>{const remaining=Math.max(0,minDelayMs-(Date.now()-start));if(remaining)await new Promise(resolve=>setTimeout(resolve,remaining))};
  async function request(url,options={}) {
    const started=Date.now();begin();
    try {const response=await fetchImpl(url,{credentials,cache:'no-store',...options});
      if(!response.ok){let reason='HTTP '+response.status;try{const data=await response.clone().json();reason=data.message||data.error||reason}catch{}throw Error(reason)}
      if(response.status===204)return null;
      return response.json();
    } finally {await hold(started);finish()}
  }
  async function download(url,filename){
    const started=Date.now();begin();
    try {const response=await fetchImpl(url,{credentials,cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);
      const blob=await response.blob();const href=URL.createObjectURL(blob);
      const anchor=document.createElement('a');anchor.href=href;anchor.download=filename;document.body.append(anchor);anchor.click();anchor.remove();
      setTimeout(()=>URL.revokeObjectURL(href),1500);
    }finally{await hold(started);finish()}
  }
  // A group keeps the loading indicator active across multiple related requests,
  // including sequential ones. Each individual request still owns its own hooks.
  async function group(work){
    if(typeof work!=='function')throw new TypeError('group requires a function');
    begin();
    try{return await work({request,download})}finally{finish()}
  }
  return Object.freeze({request,download,group});
}
