type Player={nickname:string};
const accountLabels=document.querySelectorAll<HTMLElement>('[data-player-name]');
const accountLinks=document.querySelectorAll<HTMLAnchorElement>('[data-player-account-link]');
let identityChanged=false;
function updatePlayer(player:Player|null){
 const name=player?.nickname||'Minha conta';
 accountLabels.forEach(el=>{el.textContent=name});
 accountLinks.forEach(el=>{el.setAttribute('aria-label',player?'Minha conta: '+name:'Minha conta')});
}
document.addEventListener('oldarcade:account-changed',e=>{
 const player=(e as CustomEvent<{player:Player|null}>).detail?.player||null;
 identityChanged=true;
 updatePlayer(player);
});
void(async()=>{
 try{
  const res=await fetch('/api/auth/me',{cache:'no-store'});
  if(!res.ok)return;
  const data=await res.json() as {player?:Player|null};
  if(!identityChanged)updatePlayer(data.player||null);
 }catch{}
})();
