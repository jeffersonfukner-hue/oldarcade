/** Celebrações compartilhadas: os jogos emitem eventos, este componente cuida do visual. */
type Kind='personal'|'mission'|'podium'|'leader'|'rival';
type Detail={game:string;kind:Kind;message?:string};
const overlay=document.querySelector<HTMLElement>('#game-celebration');
if(overlay){
 const title=overlay.querySelector<HTMLElement>('[data-celebration-title]')!;
 const icon=overlay.querySelector<HTMLElement>('[data-celebration-icon]')!;
 const message=overlay.querySelector<HTMLElement>('[data-celebration-message]')!;
 const replay=overlay.querySelector<HTMLAnchorElement>('[data-celebration-replay]')!;
 const labels:Record<Kind,[string,string]>={
  personal:['✨','NOVO RECORDE!'],mission:['🎯','MISSÃO CUMPRIDA!'],
  podium:['🥉','TOP 3!'],leader:['🏆','VOCÊ É O LÍDER!'],
  rival:['⚡','TE PASSARAM!']
 };
 let timeout=0;let current=0;
 function hide(){overlay.hidden=true;overlay.classList.remove('is-rival');current=0}
 document.addEventListener('oldarcade:game-started',()=>{window.clearTimeout(timeout);hide()});
 document.addEventListener('oldarcade:celebrate',event=>{
  const detail=(event as CustomEvent<Detail>).detail;
  if(!detail||!Object.hasOwn(labels,detail.kind))return;
  const priority=detail.kind==='rival'?5:detail.kind==='leader'?4:detail.kind==='podium'?3:detail.kind==='mission'?2:1;
  if(!overlay.hidden&&priority<current)return;
  window.clearTimeout(timeout);current=priority;
  const [emoji,heading]=labels[detail.kind];icon.textContent=emoji;title.textContent=heading;
  message.textContent=detail.message||'Mais uma conquista para sua história!';
  const rival=detail.kind==='rival';overlay.classList.toggle('is-rival',rival);
  replay.hidden=!rival;overlay.hidden=false;
  timeout=window.setTimeout(hide,rival?9000:2200);
 });
 overlay.addEventListener('click',event=>{if(event.target===overlay)hide()});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!overlay.hidden)hide()});
}
