import {node,action,section} from './proto-ui.js';
import {createGeneratedCrudView} from './generated-crud.js';
/** Compose multiple REST CRUD definitions without duplicating table/form logic. */
export function createCatalogSuiteView(config){return {title:config.title||'Catalogs',components:[],async onMount({host,api}){
  const wrapper=section(host,config.title||'Catalogs','Reusable catalog CRUDs with original CodeView tables and modal forms.');const bar=node('div',null,'toolbar'),workspace=node('div');wrapper.append(bar,workspace);
  async function select(c){workspace.replaceChildren();for(const b of bar.querySelectorAll('button'))b.classList.toggle('btn--primary',b.dataset.key===c.key);const view=createGeneratedCrudView(c);await view.onMount({host:workspace,api});}
  for(const item of config.catalogs){const button=action(item.title,()=>select(item),'btn btn--ghost');button.dataset.key=item.key;bar.append(button)}await select(config.catalogs[0]);
}}}
