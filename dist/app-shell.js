/** Optional REBEL presentation components. Never provides server authentication or authorization. */
const make=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=String(text);return node};
export function createAuthStore(initial=null){let current=initial;const subscribers=new Set();return Object.freeze({get current(){return current},set(value){current=value;for(const fn of subscribers)fn(current)},clear(){current=null;for(const fn of subscribers)fn(null)},subscribe(fn){subscribers.add(fn);return()=>subscribers.delete(fn)}})}
export function filterViewsByRole(views,role){return (views||[]).filter(view=>!Array.isArray(view.roles)||!view.roles.length||view.roles.includes(role))}
export function createHeroLanding({title='Welcome',subtitle='',profiles=[],onSelect,onLogin}={}){
 const hero=make('section','rebel-hero');hero.setAttribute('aria-label','Welcome');
 const content=make('div','rebel-hero-content');
 const brand=make('header','rebel-hero-brand');brand.append(make('span','rebel-hero-mark','◇'));
 const brandText=make('span','','CODEMAKERS REBEL');brandText.append(make('small','','Less framework. More freedom.'));brand.append(brandText);content.append(brand);
 const intro=make('div','rebel-hero-intro');intro.append(make('div','rebel-hero-eyebrow','BUILT AT CODEMAKERS · SHARED WITH DEVELOPERS'),make('h1','',title),make('p','',subtitle));
 if(onLogin){const login=make('button','rebel-hero-login','Sign in');login.type='button';login.addEventListener('click',onLogin);intro.append(login)}
 content.append(intro);
 if(profiles.length){content.append(make('h2','rebel-hero-label','Explore the application'));const grid=make('div','rebel-hero-profiles');for(const profile of profiles){const btn=make('button','rebel-profile-card');btn.type='button';btn.setAttribute('aria-label','Explore as '+profile.name);btn.append(make('span','rebel-profile-icon',profile.icon||'◇'),make('strong','',profile.name),make('small','',profile.description||'Explore this perspective'),make('span','rebel-profile-cta','Explore →'));btn.addEventListener('click',()=>onSelect?.(profile));grid.append(btn)}content.append(grid);content.append(make('small','rebel-hero-disclaimer','Demo roles control visible views only; they are not authentication or access control.'))}
 const footer=make('footer','rebel-hero-footer');footer.append(make('span','','A CODEMAKERS reference application'),make('span','','Vanilla JavaScript · Open source · MIT'));content.append(footer);hero.append(content);return hero;
}
export function createLoginModal({title='Sign in',onSubmit,onError,fields=['username','password']}={}){
 const dialog=make('dialog','rebel-login-dialog');const form=make('form','rebel-login-form');form.method='dialog';form.append(make('h2','',title));
 for(const field of fields){const label=make('label','',field==='username'?'Username':'Password');const input=make('input');input.name=field;input.type=field==='password'?'password':'text';input.autocomplete=field==='password'?'current-password':'username';input.required=true;label.append(input);form.append(label)}
 const actions=make('div','rebel-login-actions');const cancel=make('button','','Cancel');cancel.type='button';cancel.addEventListener('click',()=>dialog.close());const submit=make('button','','Sign in');submit.type='submit';actions.append(cancel,submit);form.append(actions);
 form.addEventListener('submit',async ev=>{ev.preventDefault();const values=Object.fromEntries(new FormData(form));try{await onSubmit?.(values);dialog.close()}catch(error){const message=error?.message||'Sign in failed';if(typeof onError==='function'){onError(message,error);return;}let note=dialog.querySelector('[data-error]');if(!note){note=make('p','rebel-login-error');note.dataset.error='';form.append(note)}note.textContent=message}});dialog.append(form);return dialog;
}
export function createUserMenu({user,onLogout,onTheme,onHome}={}){
 const root=make('div','rebel-user-menu');const button=make('button','rebel-user-trigger',`${user?.name||'Guest'} ▾`);button.type='button';button.setAttribute('aria-expanded','false');button.setAttribute('aria-haspopup','true');
 const panel=make('div','rebel-user-dropdown');panel.hidden=true;panel.setAttribute('aria-label','User options');
 panel.append(make('strong','',user?.name||'Guest'),make('small','',user?.role||'Visitor'));
 const onOutside=ev=>{if(!root.isConnected||!root.contains(ev.target))close()};
 const close=()=>{panel.hidden=true;button.setAttribute('aria-expanded','false');document.removeEventListener('pointerdown',onOutside)};
 for(const [caption,callback] of [['Home',onHome],['Toggle theme',onTheme],['Sign out',onLogout]])if(callback){const item=make('button','',caption);item.type='button';item.addEventListener('click',()=>{close();callback()});panel.append(item)}
 button.addEventListener('click',()=>{const opening=panel.hidden;panel.hidden=!opening;button.setAttribute('aria-expanded',String(opening));if(opening)document.addEventListener('pointerdown',onOutside);else document.removeEventListener('pointerdown',onOutside)});
 root.addEventListener('keydown',ev=>{if(ev.key==='Escape'){close();button.focus()}});
 root.append(button,panel);return root;
}
