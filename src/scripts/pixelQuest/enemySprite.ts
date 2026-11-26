import type {EnemyKind} from './gameplay';
/** Mesmos pixels no tabuleiro e nos quatro ícones do placar. */
export function drawEnemySprite(c:CanvasRenderingContext2D,kind:EnemyKind,x:number,y:number):void{
 const colors={patroller:'#fa8a91',runner:'#ffae64',hopper:'#a98bff',sentry:'#74dbd1'};
 c.fillStyle=colors[kind];c.fillRect(x,y,22,24);
 if(kind==='runner'){c.fillRect(x-3,y+19,7,5);c.fillRect(x+17,y+19,7,5)}
 if(kind==='hopper'){c.fillRect(x+3,y-5,6,6);c.fillRect(x+13,y-5,6,6)}
 if(kind==='sentry')c.fillRect(x+7,y-6,8,6);
 c.fillStyle='#172c52';c.fillRect(x+5,y+7,4,4);c.fillRect(x+14,y+7,4,4);
}
