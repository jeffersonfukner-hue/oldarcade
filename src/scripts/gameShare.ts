import {isTimeRanking,formatRankingValue} from '../data/rankingRules.js';
type ShareDetail={game:string;score:number};
document.querySelectorAll<HTMLElement>('[data-game-share]').forEach(section=>{
 const slug=section.dataset.gameSlug||'';
 const name=section.dataset.gameName||'Jogo';
 if(!/^[a-z0-9-]+$/.test(slug))return;
 // Usa o endereço real do ambiente atual. Preview não é divulgado como domínio de produção.
 const path=section.dataset.gamePath||'/jogos/'+slug+'/';
 const url=new URL(path,window.location.origin).toString();
 let score:number|null=null;
 const feedback=section.querySelector<HTMLElement>('[data-share-feedback]');
 const copy=section.querySelector<HTMLButtonElement>('[data-share-copy]');
 const native=section.querySelector<HTMLButtonElement>('[data-share-native]');
 const message=()=>score===null?
  'Vem jogar '+name+' comigo no OldArcade! Você consegue me superar?':
  isTimeRanking(slug)?
   'Completei 40 linhas no '+name+' em '+formatRankingValue(slug,score)+'! Consegue ser mais rápido?':
   'Fiz '+score+' pontos no '+name+' do OldArcade! Consegue superar minha pontuação?';
 const invite=()=>message()+' '+url;
 function render(){
  const text=message(),encodedUrl=encodeURIComponent(url),encodedText=encodeURIComponent(text);
  const links:Record<string,string>={
   whatsapp:'https://wa.me/?text='+encodeURIComponent(invite()),
   telegram:'https://t.me/share/url?url='+encodedUrl+'&text='+encodedText,
   facebook:'https://www.facebook.com/sharer/sharer.php?u='+encodedUrl,
   x:'https://x.com/intent/tweet?url='+encodedUrl+'&text='+encodedText,
   reddit:'https://www.reddit.com/submit?url='+encodedUrl+'&title='+encodedText,
   bluesky:'https://bsky.app/intent/compose?text='+encodeURIComponent(invite())
  };
  section.querySelectorAll<HTMLAnchorElement>('[data-share-network]').forEach(a=>{
   const network=a.dataset.shareNetwork||'';
   if(links[network])a.href=links[network];
  });
  const caption=section.querySelector<HTMLElement>('[data-share-message]');
  if(caption)caption.textContent=score===null?'Compartilhe o '+name+' e desafie alguém a jogar.':text;
 }
 native?.addEventListener('click',async()=>{
  if(typeof navigator.share!=='function'){
   if(feedback)feedback.textContent='Use uma rede social abaixo ou copie o convite.';
   return;
  }
  try{
   await navigator.share({title:'Desafio '+name+' — OldArcade',text:message(),url});
   if(feedback)feedback.textContent='Convite enviado para o aplicativo escolhido.';
  }catch(error){
   if((error as Error).name!=='AbortError'&&feedback)feedback.textContent='Não foi possível abrir o compartilhamento. Use uma das opções abaixo.';
  }
 });
 copy?.addEventListener('click',async()=>{
  try{
   await navigator.clipboard.writeText(invite());
   if(feedback)feedback.textContent='Convite copiado! Envie para desafiar um amigo.';
  }catch{
   if(feedback)feedback.textContent='Não foi possível copiar automaticamente. Use um dos links de compartilhamento.';
  }
 });
 document.addEventListener('oldarcade:game-finished',event=>{
  const detail=(event as CustomEvent<ShareDetail>).detail;
  if(detail?.game!==slug||!Number.isFinite(detail.score)||detail.score<0||Math.abs(detail.score*1000-Math.round(detail.score*1000))>1e-7)return;
  score=detail.score;
  render();
 });
 render();
});
