/** Pódio comum de contas: mesmos cards no ranking central e nas páginas de jogo. */
type PodiumEntry={nickname:string;score:number};
export function renderRankingPodium(
 container:HTMLElement,
 entries:PodiumEntry[],
 format:(score:number)=>string,
 emptyLabel='Ainda não há jogadores classificados.'
){
 container.replaceChildren();
 const medals=['🥇','🥈','🥉'];
 entries.slice(0,3).forEach((entry,index)=>{
  const card=document.createElement('article');
  card.className='rankings-podium-card podium-'+(index+1);
  const medal=document.createElement('span');
  medal.textContent=medals[index];
  medal.setAttribute('aria-label',(index+1)+'º lugar');
  const name=document.createElement('strong');name.textContent=entry.nickname;
  const score=document.createElement('span');score.textContent=format(entry.score);
  card.append(medal,name,score);container.append(card);
 });
 if(!entries.length){
  const empty=document.createElement('p');empty.className='small muted';empty.textContent=emptyLabel;container.append(empty);
 }
}
