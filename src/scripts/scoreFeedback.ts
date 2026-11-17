/** Feedback não bloqueante de pontuação. Usa a animação .score-float global do OldArcade.
 * O jogo escolhe o local e o conteúdo; posicionamento, temporização e acessibilidade ficam aqui.
 */
export function showScoreFeedback(
 container:HTMLElement,
 canvas:HTMLCanvasElement,
 value:number,
 context:string,
 row:number,
 rows:number
):void{
 if(value<=0)return;
 const board=canvas.getBoundingClientRect();
 const host=container.getBoundingClientRect();
 if(!board.width||!board.height)return;
 const element=document.createElement('span');
 element.className='score-float';
 element.textContent='+'+value.toLocaleString('pt-BR')+' · '+context;
 element.setAttribute('role','status');
 element.setAttribute('aria-label',value+' pontos por '+context);
 element.style.left=(board.left-host.left+board.width/2)+'px';
 element.style.top=(board.top-host.top+(Math.max(0,Math.min(rows-1,row))+.5)*board.height/rows)+'px';
 element.style.zIndex='9';
 element.style.color='#ffe38d';
 element.style.textShadow='0 2px 12px #041314,0 0 16px #e8a22e';
 container.append(element);
 element.addEventListener('animationend',()=>element.remove(),{once:true});
 window.setTimeout(()=>element.remove(),1400);
}
