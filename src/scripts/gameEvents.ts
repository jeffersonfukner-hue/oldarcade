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
