type Player={nickname:string};
type AuthResult={player?:Player;recoveryCode?:string;error?:string};
const overlay=document.querySelector<HTMLElement>('[data-global-auth]');
if(overlay){
 const dialog=overlay.querySelector<HTMLElement>('.oa-auth-dialog')!;
 const closeButton=overlay.querySelector<HTMLButtonElement>('[data-auth-close]')!;
 const tabs=Array.from(overlay.querySelectorAll<HTMLButtonElement>('[data-auth-tab]'));
 const login=overlay.querySelector<HTMLFormElement>('[data-auth-form="login"]')!;
 const register=overlay.querySelector<HTMLFormElement>('[data-auth-form="register"]')!;
 const message=overlay.querySelector<HTMLElement>('[data-auth-message]')!;
 const recovery=overlay.querySelector<HTMLElement>('[data-auth-recovery]')!;
 const code=overlay.querySelector<HTMLElement>('[data-auth-recovery-code]')!;
 const done=overlay.querySelector<HTMLButtonElement>('[data-auth-recovery-done]')!;
 let lastFocus:HTMLElement|null=null,waiting=false;
 function choose(tab:'login'|'register'){
  login.hidden=tab!=='login';register.hidden=tab!=='register';
  tabs.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.authTab===tab)));
  message.textContent='';
  (tab==='login'?login:register).querySelector<HTMLInputElement>('input')?.focus({preventScroll:true});
 }
 function close(){
  if(waiting||overlay.hidden)return;
  overlay.hidden=true;recovery.hidden=true;login.reset();register.reset();
  document.body.classList.remove('oa-auth-open');
  lastFocus?.focus({preventScroll:true});lastFocus=null;
 }
 function open(tab:'login'|'register'='login'){
  if(!overlay.hidden)return;
  lastFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  overlay.hidden=false;document.body.classList.add('oa-auth-open');
  recovery.hidden=true;message.textContent='';
  choose(tab);
 }
 document.addEventListener('oldarcade:open-auth',event=>{
  const detail=(event as CustomEvent<{tab?:string}>).detail;
  open(detail?.tab==='register'?'register':'login');
 });
 document.addEventListener('click',event=>{
  const target=event.target;
  if(!(target instanceof Element))return;
  const trigger=target.closest<HTMLElement>('[data-auth-trigger]');
  if(!trigger)return;
  event.preventDefault();
  open(trigger.dataset.authTrigger==='register'?'register':'login');
 });
 closeButton.addEventListener('click',close);
 overlay.addEventListener('click',event=>{if(event.target===overlay)close()});
 document.addEventListener('keydown',event=>{
  if(overlay.hidden)return;
  if(event.key==='Escape'){event.preventDefault();close();return}
  if(event.key!=='Tab')return;
  const focusable=Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href]'))
   .filter(node=>!node.closest('[hidden]')&&node.getClientRects().length>0);
  if(focusable.length===0)return;
  const first=focusable[0],last=focusable[focusable.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 });
 tabs.forEach(tab=>tab.addEventListener('click',()=>choose(tab.dataset.authTab==='register'?'register':'login')));
 for(const [kind,form] of [['login',login],['register',register]] as const){
  form.addEventListener('submit',async event=>{
   event.preventDefault();
   if(waiting)return;
   const button=form.querySelector<HTMLButtonElement>('button[type=submit]')!;
   waiting=true;button.disabled=true;message.textContent=kind==='login'?'Entrando…':'Criando sua conta…';
   const formData=new FormData(form);
   const payload=Object.fromEntries(formData.entries()) as Record<string,string|boolean>;
   if(kind==='register'){
    payload.recordEmailOptIn=formData.has('recordEmailOptIn');
    payload.dailyEmailOptIn=formData.has('dailyEmailOptIn');
   }
   try{
    const response=await fetch('/api/auth/'+kind,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await response.json() as AuthResult;
    if(!response.ok||!data.player)throw Error(data.error||'Não foi possível entrar.');
    document.dispatchEvent(new CustomEvent('oldarcade:account-changed',{detail:{player:data.player}}));
    if(data.recoveryCode){
     code.textContent=data.recoveryCode;
     recovery.hidden=false;
     login.hidden=true;register.hidden=true;tabs.forEach(tab=>tab.disabled=true);
     message.textContent='Sua conta está pronta. Guarde o código antes de continuar.';
     done.focus({preventScroll:true});
    }else{
     message.textContent='';
     close();
    }
   }catch(error){message.textContent=error instanceof Error?error.message:'Não foi possível concluir o acesso.'}
   finally{waiting=false;button.disabled=false}
  });
 }
 done.addEventListener('click',()=>{
  tabs.forEach(tab=>tab.disabled=false);
  close();
 });
}
