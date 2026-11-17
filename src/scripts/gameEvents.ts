/** Contrato compartilhado: um início real de partida por jogo/modo. */
import {gameModes} from '../data/gameModes.js';
export type GameModeId=keyof typeof gameModes;
export function recordGameStart(game:GameModeId){
 const eventId=crypto.randomUUID();
 document.dispatchEvent(new CustomEvent('oldarcade:game-started',{detail:{game,eventId}}));
 return eventId;
}
export async function recordGlobalPlay(game:GameModeId,eventId:string){
 try{
  const response=await fetch('/api/games/'+encodeURIComponent(game)+'/stats',{
   method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({kind:'play',eventId})
  });
  return response.ok;
 }catch{return false;}
}

/** Eventos de pontuação e encerramento consumidos por ranking e compartilhamento. */
export function recordGameScore(game:GameModeId,score:number){
 document.dispatchEvent(new CustomEvent('oldarcade:game-score',{detail:{game,score}}));
}
export function recordGameFinish(game:GameModeId,score:number,durationMs:number){
 document.dispatchEvent(new CustomEvent('oldarcade:game-finished',{detail:{game,score,durationMs}}));
}
