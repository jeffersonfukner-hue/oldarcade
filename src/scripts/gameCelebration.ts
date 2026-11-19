import {arcadePersonality} from './arcadePersonality';
/** Celebrações compartilhadas: os jogos emitem eventos, este componente cuida do visual. */
type Kind='personal'|'mission'|'podium'|'leader'|'rival'|'danger'|'rescue'|'provisional'|'defeat';
type Detail={game:string;kind:Kind;message?:string;final?:boolean;rank?:number};
const overlay=document.querySelector<HTMLElement>('#game-celebration')!;
if(overlay){
 const title=overlay.querySelector<HTMLElement>('[data-celebration-title]')!;
 const icon=overlay.querySelector<HTMLElement>('[data-celebration-icon]')!;
 const message=overlay.querySelector<HTMLElement>('[data-celebration-message]')!;
 const replay=overlay.querySelector<HTMLAnchorElement>('[data-celebration-replay]')!;
 const home=overlay.parentElement!;
 const board=document.querySelector<HTMLElement>('#game-screen, #adventure-screen, .screen-wrap');
 const labels:Record<Kind,[string,string]>={
  personal:['✨','NOVO RECORDE!'],mission:['🎯','MISSÃO CUMPRIDA!'],
  podium:['🥉','TOP 3!'],leader:['🏆','VOCÊ É O LÍDER!'],
  rival:['⚡','TE PASSARAM!'],danger:['🐍','CUIDADO!'],rescue:['🍇','SALVA-COBRA!'],provisional:['🏆','MARCA GLOBAL SUPERADA!'],defeat:['💥','FIM DE JOGO!']
 };
 let timeout=0;let current=0;let lastPersonalityAt=0;
 function hide(){overlay.hidden=true;overlay.classList.remove('is-rival','is-final','is-podium');current=0}
 document.addEventListener('oldarcade:game-started',()=>{window.clearTimeout(timeout);hide()});
 document.addEventListener('oldarcade:celebrate',event=>{
  const detail=(event as CustomEvent<Detail>).detail;
  if(!detail||!Object.hasOwn(labels,detail.kind))return;
  if(detail.kind==='danger'||detail.kind==='rescue'){
   const now=Date.now();if(detail.game!=='preview-simulator'&&now-lastPersonalityAt<15000)return;
   lastPersonalityAt=now;
  }
  const priority=detail.final?10:detail.kind==='rival'?5:detail.kind==='leader'?4:detail.kind==='podium'?3:detail.kind==='mission'?2:1;
  if(!overlay.hidden&&priority<current)return;
  window.clearTimeout(timeout);current=priority;
  const [emoji,heading]=labels[detail.kind];
  const rank=detail.kind==='podium'&&typeof detail.rank==='number'&&Number.isInteger(detail.rank)&&detail.rank>=2&&detail.rank<=3?detail.rank:null;
  icon.textContent=rank===2?'🥈':rank===3?'🥉':emoji;
  title.textContent=rank?rank+'º LUGAR!':heading;
  message.textContent=detail.message||'Mais uma conquista para sua história!';
  const final=Boolean(detail.final);
  // Pódio/liderança sempre em primeiro plano na janela, mesmo após login ou scroll.
  // Celebrações de jogo permanecem ancoradas ao tabuleiro.
  if(detail.kind==='podium'||detail.kind==='leader')home.append(overlay);
  else if(board)board.append(overlay);
  else home.append(overlay);
  overlay.classList.toggle('is-final',final);
  overlay.classList.toggle('is-podium',detail.kind==='podium'||detail.kind==='leader');
  overlay.classList.remove('is-rival');
  replay.hidden=true;overlay.hidden=false;
  const card=overlay.querySelector<HTMLElement>('.oa-celebration-card');
  if(card){card.style.animation='none';void card.offsetWidth;card.style.animation=''}
  const longMessage=detail.kind==='danger'||detail.kind==='rescue';
  timeout=window.setTimeout(hide,final?4000:detail.kind==='podium'||detail.kind==='leader'?2600:longMessage?2700:1400);
 });
 overlay.addEventListener('click',event=>{if(event.target===overlay)hide()});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!overlay.hidden)hide()});
}

// Ferramenta de validação: somente subdomínios de Preview do projeto Cloudflare.
// O domínio base *.pages.dev de produção e qualquer domínio personalizado ficam excluídos.
const previewHost=/^[a-z0-9-]+\.oldarcade-17c\.pages\.dev$/i;
const testPanel=document.querySelector<HTMLElement>('#celebration-test-panel');
if(testPanel&&previewHost.test(window.location.hostname)&&new URLSearchParams(window.location.search).get('celebration-lab')==='1'){
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
    rival:'Alguém já tomou a dianteira! Vai deixar assim?',
    danger:'',rescue:'',provisional:'Você passou a marca global! Confirmação no fim da partida.',defeat:'Fim de jogo! Hora da revanche.'
   };
   if(kind==='danger'||kind==='rescue'){arcadePersonality('snake',kind);return}
   document.dispatchEvent(new CustomEvent('oldarcade:celebrate',{detail:{game:'preview-simulator',kind,message:examples[kind]}}));
  });
 });
}
