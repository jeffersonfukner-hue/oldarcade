/** Convite global exibido ao fim da partida, sem bloquear o Game Over ou o replay. */
import {formatRankingValue} from '../data/rankingRules.js';
import {gameMode} from '../data/gameModes.js';
const box=document.querySelector<HTMLElement>('[data-end-account-invite]');
if(box){
 const copy=box.querySelector<HTMLElement>('[data-end-invite-result]')!;
 const link=box.querySelector<HTMLAnchorElement>('[data-end-invite-ranking]')!;
 const dismiss=box.querySelector<HTMLButtonElement>('[data-end-invite-dismiss]')!;
 let activeAccount=false,sequence=0;
 const session=fetch('/api/auth/me',{cache:'no-store'}).then(async response=>{
  if(!response.ok)return;
  const payload=await response.json() as {player?:{nickname:string}|null};
  activeAccount=Boolean(payload.player);
  if(activeAccount)box.hidden=true;
 }).catch(()=>{});
 const hide=()=>{sequence++;box.hidden=true};
 dismiss.addEventListener('click',hide);
 document.addEventListener('oldarcade:game-started',hide);
 document.addEventListener('oldarcade:account-changed',event=>{
  const player=(event as CustomEvent<{player?:{nickname:string}|null}>).detail?.player;
  activeAccount=Boolean(player);
  if(activeAccount)hide();
 });
 document.addEventListener('oldarcade:game-finished',async event=>{
  const detail=(event as CustomEvent<{game:string;score:number;recordDelayMs?:number}>).detail;
  if(!detail||!gameMode(detail.game)||!Number.isFinite(detail.score))return;
  const current=++sequence;
  // Não disputar espaço visual com a animação de Game Over.
  const delay=Math.min(Math.max(detail.recordDelayMs??1000,800),7000);
  await session;
  await new Promise<void>(resolve=>window.setTimeout(resolve,delay));
  if(current!==sequence||activeAccount)return;
  copy.textContent='Você marcou '+formatRankingValue(detail.game,detail.score)+'. Entre ou crie uma conta para participar; os recordes dos outros jogadores já estão disponíveis.';
  link.href='/rankings/#ranking-'+encodeURIComponent(detail.game);
  box.hidden=false;
 });
}
