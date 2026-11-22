import type {Level,Tile} from '../../scripts/pixelQuest/levels';
import {firstLevel} from './level-1-1';

/** Primeiro mundo: progressão de manhã para noite, com chefe na terceira fase. */
function makeLevel(id:string,width:number,variant:2|3):Level{
 const height=18;
 const tiles:Tile[][]=Array.from({length:height},()=>Array<Tile>(width).fill(0));
 const solid=(a:number,b:number,row:number)=>{for(let x=a;x<=b;x++)tiles[row][x]=1};
 // Lacunas curtas, saltáveis mesmo com o movimento e altura atuais.
 solid(0,42,15);solid(45,83,15);solid(86,121,15);
 solid(124,width-1,15);
 for(const [start,row,span] of [
  [15,13,4],[29,12,3],[55,13,4],[68,12,4],[96,13,4],
  [110,12,3],[136,13,5],[150,12,4],[168,13,4]
 ] as const)if(start+span<width-2)solid(start,start+span,row);
 const ground=15*32;
 const crystalCols=variant===2?[6,18,32,49,61,78,91,111,129,146,166]:
  [8,20,35,50,64,80,97,113,130,146,164,181];
 const patrolCols=variant===2?[25,59,89,116,143,161]:[24,57,89,120,146,174];
 const entities:Level['entities']=[
  {kind:'player',x:64,y:ground-29},
  ...crystalCols.map(col=>({kind:'crystal' as const,x:col*32,y:tiles[13][col]===1?13*32-26:ground-45})),
  ...patrolCols.map(col=>({kind:'patroller' as const,x:col*32,y:ground-24})),
  {kind:'checkpoint',x:(variant===3?105:93)*32,y:ground-48},
  ...(variant===3?[{kind:'boss' as const,x:(width-18)*32,y:ground-56}]:[]),
  {kind:'exit',x:(width-3)*32,y:ground-64}
 ];
 return {id,world:'Floresta Esmeralda',width,height,tileSize:32,tiles,entities};
}

export const worldOneLevels:readonly Level[]=[
 firstLevel,
 makeLevel('1-2',186,2),
 makeLevel('1-3',196,3)
];
export const worldOneTotal=worldOneLevels.length;
