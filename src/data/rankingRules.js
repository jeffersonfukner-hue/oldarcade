/** Contrato global de critérios competitivos. Sprint armazena duração em ms na
 * coluna score já existente; sem migrar D1 nem inverter número artificialmente. */
import {gameMode} from './gameModes.js';
export function isTimeRanking(id){return gameMode(id)?.ranking==='time'}
export function formatRankingValue(id,value){
 if(value===null||value===undefined||!Number.isFinite(value))return '—';
 if(!isTimeRanking(id))return value.toLocaleString('pt-BR')+' pontos';
 const total=Math.max(0,Math.round(value));
 const minutes=Math.floor(total/60000);
 const seconds=String(Math.floor(total/1000)%60).padStart(2,'0');
 const millis=String(total%1000).padStart(3,'0');
 return minutes+':'+seconds+'.'+millis;
}
export function betterResult(id,newValue,previous){
 return previous===null||previous===undefined||(isTimeRanking(id)?newValue<previous:newValue>previous);
}
