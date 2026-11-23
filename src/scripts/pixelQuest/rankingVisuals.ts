/** Celebração leve do ranking, desenhada no canvas sem imagens, rede ou créditos. */
export type RankingCelebration={message:string;detail:string;rank:1|2|3|null;startedAt:number};
export function drawRankingCelebration(ctx:CanvasRenderingContext2D,fx:RankingCelebration|null,now:number,reducedMotion=false):void{
 if(!fx)return;
 const elapsed=now-fx.startedAt;
 if(elapsed<0||elapsed>2700)return;
 const progress=elapsed/2700;
 ctx.save();
 ctx.globalAlpha=progress>.82?(1-progress)/.18:1;
 const width=410,x=(640-width)/2,y=46,height=65;
 ctx.fillStyle='rgba(11,21,43,.92)';ctx.fillRect(x,y,width,height);
 ctx.strokeStyle=fx.rank===1?'#ffe08d':fx.rank===2?'#a9dfff':fx.rank===3?'#dbb8ff':'#9aeabf';
 ctx.lineWidth=2;ctx.strokeRect(x,y,width,height);
 ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.fillStyle='#fff6d8';ctx.font='bold 20px system-ui';ctx.fillText(fx.message,320,y+25);
 ctx.fillStyle='#dbeafa';ctx.font='12px system-ui';ctx.fillText(fx.detail,320,y+49);
 if(fx.rank===1&&!reducedMotion){
  const colors=['#ffe38a','#ff79ad','#9bf3ff','#c5a4ff','#a6ffb6'];
  const bursts=[[145,190],[500,171],[324,210]];
  for(let b=0;b<bursts.length;b++){
   const t=Math.max(0,elapsed/1000-b*.19);
   if(t===0||t>1.8)continue;
   for(let i=0;i<24;i++){
    const angle=i*Math.PI*2/24+b*.32,r=t*80;
    ctx.globalAlpha=Math.max(0,1-t/1.8);
    ctx.fillStyle=colors[(i+b)%colors.length];
    const px=bursts[b][0]+Math.cos(angle)*r;
    const py=bursts[b][1]+Math.sin(angle)*r+t*t*24;
    ctx.fillRect(px,py,3+(i%3),3+(i%2));
   }
  }
 }
 ctx.restore();
}
