type Player={nickname:string};
const accountLabels=document.querySelectorAll<HTMLElement>('[data-player-name]');
const accountLinks=document.querySelectorAll<HTMLAnchorElement>('[data-player-account-link]');
const authEntries=document.querySelectorAll<HTMLElement>('[data-auth-entry]');
let identityChanged=false,checkVersion=0;
function updatePlayer(player:Player|null){
 const name=player?.nickname||'Minha conta';
 accountLabels.forEach(el=>{el.textContent=name});
 accountLinks.forEach(el=>{el.setAttribute('aria-label',player?'Minha conta: '+name:'Minha conta')});
 authEntries.forEach(el=>{el.hidden=!!player});
}
document.addEventListener('oldarcade:account-changed',e=>{
 const player=(e as CustomEvent<{player:Player|null}>).detail?.player||null;
 identityChanged=true;
 updatePlayer(player);
});
async function checkAccount(restored=false){
 const version=++checkVersion;
 if(restored){
  // O navegador pode restaurar páginas antigas do BFCache (botão Voltar).
  // Ocultar a identidade e os recordes anteriores até confirmar a sessão.
  document.dispatchEvent(new CustomEvent('oldarcade:account-changed',{detail:{player:null}}));
 }
 try{
  const res=await fetch('/api/auth/me',{cache:'no-store'});
  if(version!==checkVersion)return;
  if(!res.ok){
   if(restored)document.dispatchEvent(new CustomEvent('oldarcade:session-refreshed',{detail:{player:null}}));
   return;
  }
  const data=await res.json() as {player?:Player|null};
  if(version!==checkVersion)return;
  const player=data.player||null;
  if(restored){
   document.dispatchEvent(new CustomEvent('oldarcade:account-changed',{detail:{player}}));
   document.dispatchEvent(new CustomEvent('oldarcade:session-refreshed',{detail:{player}}));
  }else if(!identityChanged)updatePlayer(player);
 }catch{
  // Nunca restabelecer a identidade anterior se a sessão não pôde ser verificada.
  if(restored&&version===checkVersion)document.dispatchEvent(new CustomEvent('oldarcade:session-refreshed',{detail:{player:null}}));
 }
}
window.addEventListener('pageshow',event=>{
 if(event.persisted)void checkAccount(true);
});
void checkAccount();
