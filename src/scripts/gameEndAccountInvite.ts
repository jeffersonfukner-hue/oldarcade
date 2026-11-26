/** Convite global exibido ao fim da partida, sem bloquear o Game Over ou o replay. */
import {formatRankingValue} from '../data/rankingRules.js';
import {gameMode} from '../data/gameModes.js';
const box=document.querySelector<HTMLElement>('[data-end-account-invite]');
if(box){
 const copy=box.querySelector<HTMLElement>('[data-end-invite-result]')!;
 const link=box.querySelector<HTMLAnchorElement>('[data-end-invite-ranking]')!;
 const dismiss=box.querySelector<HTMLButtonElement>('[data-end-invite-dismiss]')!;
 const skip=box.querySelector<HTMLButtonElement>('[data-end-invite-skip]')!;
 // Mantém o convite dentro do palco, inclusive no fullscreen nativo.
 document.querySelector<HTMLElement>('.game-stage')?.append(box);
 let activeAccount=false,sequence=0,accountVersion=0;
 async function confirmedVisitor(){
  if(activeAccount)return false;
  const version=accountVersion;
  try{const response=await fetch('/api/auth/me',{cache:'no-store'});if(!response.ok||version!==accountVersion)return false;
   const payload=await response.json() as {player?:{nickname:string}|null};if(version!==accountVersion)return false;
   activeAccount=Boolean(payload.player);return payload.player===null;
  }catch{return false;}
 }
 const versionAtStart=accountVersion;
 const session=fetch('/api/auth/me',{cache:'no-store'}).then(async response=>{
  if(!response.ok)return;
  const payload=await response.json() as {player?:{nickname:string}|null};
  if(versionAtStart!==accountVersion)return;
  activeAccount=Boolean(payload.player);
  if(activeAccount)box.hidden=true;
 }).catch(()=>{});
 const hide=()=>{sequence++;box.hidden=true};
 dismiss.addEventListener('click',hide);
 skip.addEventListener('click',hide);
 box.addEventListener('click',event=>{if(event.target===box)hide()});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!box.hidden&&!document.querySelector<HTMLElement>('[data-global-auth]:not([hidden])'))hide()});
 document.addEventListener('oldarcade:game-started',hide);
 document.addEventListener('oldarcade:account-changed',event=>{
  const player=(event as CustomEvent<{player?:{nickname:string}|null}>).detail?.player;
  accountVersion++;
  activeAccount=Boolean(player);
  if(activeAccount)hide();
 });
 document.addEventListener('oldarcade:tetris-mission-start',hide);
 document.addEventListener('oldarcade:tetris-mission-finished',async event=>{
  const detail=(event as CustomEvent<{scope:string;score:number;recordDelayMs:number}>).detail;
  const current=++sequence;
  await session;
  await new Promise<void>(resolve=>window.setTimeout(resolve,detail.recordDelayMs));
  if(current!==sequence||activeAccount||!await confirmedVisitor()||current!==sequence||activeAccount)return;
  copy.textContent='Você marcou '+detail.score+' pontos nesta missão. Entre ou crie uma conta para registrar o resultado.';
  link.href='/rankings/#tetris-v2';
  box.hidden=false;dismiss.focus({preventScroll:true});
 });
 document.addEventListener('oldarcade:game-finished',async event=>{
  const detail=(event as CustomEvent<{game:string;score:number;recordDelayMs?:number;eligible?:boolean}>).detail;
  if(!detail||!gameMode(detail.game)||!Number.isFinite(detail.score))return;
  if(detail.game==='pixel-quest'&&detail.eligible===false){hide();return}
  const current=++sequence;
  // Não disputar espaço visual com a animação de Game Over.
  const delay=Math.min(Math.max(detail.recordDelayMs??1000,800),7000);
  await session;
  await new Promise<void>(resolve=>window.setTimeout(resolve,delay));
  if(current!==sequence||activeAccount||!await confirmedVisitor()||current!==sequence||activeAccount)return;
  copy.textContent='Você marcou '+formatRankingValue(detail.game,detail.score)+'. Entre ou crie uma conta para participar; os recordes dos outros jogadores já estão disponíveis.';
  link.href='/rankings/#ranking-'+encodeURIComponent(detail.game);
  box.hidden=false;
  dismiss.focus({preventScroll:true});
 });
}
