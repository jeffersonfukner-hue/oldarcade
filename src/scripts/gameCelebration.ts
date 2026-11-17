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

// Ferramenta de validação: somente subdomínios de Preview do projeto Cloudflare.
// O domínio base *.pages.dev de produção e qualquer domínio personalizado ficam excluídos.
const previewHost=/^[a-z0-9-]+\.oldarcade-17c\.pages\.dev$/i;
const testPanel=document.querySelector<HTMLElement>('#celebration-test-panel');
if(testPanel&&previewHost.test(window.location.hostname)){
 testPanel.hidden=false;
 testPanel.querySelectorAll<HTMLButtonElement>('[data-test-celebration]').forEach(button=>{
  button.addEventListener('click',()=>{
   const kind=button.dataset.testCelebration as Kind;
   if(!kind)return;
   const examples:Record<Kind,string>={
    personal:'Você superou sua melhor marca!',
    mission:'Meta alcançada! Prepare-se para o próximo desafio.',
    podium:'Você conquistou uma vaga entre os melhores!',
    leader:'Primeiro lugar confirmado! Agora defenda o topo.',
    rival:'Alguém já tomou a dianteira! Vai deixar assim?'
   };
   document.dispatchEvent(new CustomEvent('oldarcade:celebrate',{detail:{game:'preview-simulator',kind,message:examples[kind]}}));
  });
 });
}
