/** Marcos de pontuação do Snake: textos, gatilhos e animação compartilhados.
 * Clássico, Evolution e Aventura usam este módulo; a mecânica permanece em cada modo.
 */
export type SnakeMilestone={score:number;message:string};
export const snakeMilestones:readonly SnakeMilestone[]=[
 {score:100,message:'NOSSA! 100 PONTOS!'},
 {score:200,message:'OLHA SÓ! 200 PONTOS!'},
 {score:400,message:'MANDOU BEM! 400 PONTOS!'},
 {score:800,message:'FANTÁSTICO! 800 PONTOS!'},
 {score:1600,message:'CARAMBA, VOCÊ É BOM! 1.600 PONTOS!'},
 {score:3200,message:'VOCÊ É UMA LENDA! 3.200 PONTOS!'},
 {score:6400,message:'INACREDITÁVEL! 6.400 PONTOS!'},
 {score:12800,message:'VOCÊ DOMINOU O ARCADE! 12.800 PONTOS!'},
 {score:25600,message:'LENDÁRIO! 25.600 PONTOS!'},
];

/** Devolve o próximo marco alcançado, sem reapresentar marcos já celebrados. */
export function nextSnakeMilestone(score:number,lastCelebratedIndex:number):{index:number;message:string}|null{
 const index=snakeMilestones.findIndex((milestone,i)=>score>=milestone.score&&lastCelebratedIndex<i+1);
 return index<0?null:{index:index+1,message:snakeMilestones[index].message};
}

type Point={x:number;y:number};
type SnakeMomentOptions={canvas:HTMLCanvasElement;container:HTMLElement;layer:HTMLElement;gridSize:number};

/** Um único efeito visual para marcos e elogios, projetado na posição real da cobra. */
export function showSnakeMoment(message:string,at:Point,{canvas,container,layer,gridSize}:SnakeMomentOptions):void{
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const board=canvas.getBoundingClientRect(),bounds=container.getBoundingClientRect();
 if(!board.width||!board.height)return;
 [message,'✦','★'].forEach((label,i)=>{
  const item=document.createElement('span');
  item.className='score-float';
  item.textContent=label;
  item.style.left=(board.left-bounds.left+(at.x+.5)*board.width/gridSize+(i-1)*28)+'px';
  item.style.top=(board.top-bounds.top+(at.y+.5)*board.height/gridSize-i*17)+'px';
  item.style.fontSize=i===0?'clamp(22px, 4vw, 40px)':'24px';
  item.style.fontWeight='900';
  item.style.color=i===0?'#fff0a6':'#80ffca';
  item.style.textShadow='0 2px 9px #071a20, 0 0 16px #ffe08a';
  item.style.zIndex='6';
  item.style.animationDelay=(i*90)+'ms';
  layer.append(item);
  item.addEventListener('animationend',()=>item.remove(),{once:true});
  window.setTimeout(()=>item.remove(),1500);
 });
}
