/* OAACT: paginación local compartida, sin solicitudes al cambiar página. */
export function createPaginator({sizes=[5,10,50,100]}={}){
 const memory=new Map();
 function mount(host,{total,page=1,size=5,onChange,key='default'}={}){
  if(!host)return; const pages=Math.max(1,Math.ceil(total/size));page=Math.min(Math.max(1,page),pages);
  host.replaceChildren();host.classList.add('oaact-crud-pagination','oaact-page-controls');
  const limitLabel=document.createElement('label');limitLabel.className='oaact-page-size';limitLabel.textContent='Mostrar ';
  const select=document.createElement('select');select.setAttribute('aria-label','Registros por página');
  for(const n of sizes)select.add(new Option(String(n),String(n)));select.value=String(size);
  select.onchange=()=>{const n=Number(select.value);memory.set(key,n);onChange(1,n)};
  limitLabel.append(select,document.createTextNode(' registros'));
  const info=document.createElement('span');info.className='oaact-page-info';info.textContent=total?`${(page-1)*size+1}–${Math.min(page*size,total)} de ${total}`:'0 registros';
  const controls=document.createElement('div');controls.className='oaact-page-buttons';
  for(const [text,destination,description] of [['«',1,'Primera página'],['‹',page-1,'Página anterior'],['›',page+1,'Página siguiente'],['»',pages,'Última página']]){
    const button=document.createElement('button');button.type='button';button.className='btn btn--ghost';button.textContent=text;button.title=description;button.setAttribute('aria-label',description);button.disabled=destination<1||destination>pages||destination===page;
    button.onclick=()=>onChange(destination,size);controls.append(button);
  }
  const index=document.createElement('span');index.className='oaact-page-index';index.textContent=`${page} / ${pages}`;
  controls.insertBefore(index,controls.children[2]);host.append(limitLabel,info,controls);
 }
 function remembered(key){return memory.get(key)||5}
 return Object.freeze({mount,remembered});
}
