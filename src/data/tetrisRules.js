/** Física paramétrica do Tetris: o mesmo motor consulta estas regras em todos os modos. */
import {gameModes} from './gameModes.js';
export function tetrisLevel(modeId,lines,elapsedMs){
 if(modeId==='tetris-sprint')return 1;
 if(modeId==='tetris-survival')return Math.min(30,Math.floor(Math.max(0,elapsedMs)/gameModes['tetris-survival'].speedIntervalMs)+1);
 return Math.min(30,Math.floor(lines/10)+1);
}
export function tetrisGravityMs(modeId,lines,elapsedMs){
 if(modeId==='tetris-sprint')return 900;
 const stage=tetrisLevel(modeId,lines,elapsedMs);
 return Math.max(70,900*Math.pow(modeId==='tetris-survival'?0.82:0.80,stage-1));
}
