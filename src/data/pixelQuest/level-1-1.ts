import type {Level,Tile} from '../../scripts/pixelQuest/levels';
// Fase 1-1 experimental: geometria provisória com cristais, patrulheiros, checkpoint e portal.
const width=96,height=18;
const tiles:Tile[][]=Array.from({length:height},()=>Array<Tile>(width).fill(0));
function solid(from:number,to:number,row:number){for(let x=from;x<=to;x++)tiles[row][x]=1}
solid(0,35,15);solid(38,68,15);solid(71,95,15);
solid(18,22,14);solid(28,31,13);solid(40,44,14);
solid(51,54,14);solid(59,63,13);solid(75,79,14);
export const firstLevel:Level={
 id:'1-1',world:'Floresta Esmeralda',width,height,tileSize:32,tiles,
 entities:[
  {kind:'player',x:64,y:15*32-29},
  {kind:'crystal',x:160,y:15*32-40},
  {kind:'crystal',x:240,y:15*32-40},
  {kind:'crystal',x:320,y:15*32-40},
  {kind:'patroller',x:790,y:15*32-24},
  {kind:'crystal',x:1200,y:15*32-48},
  {kind:'crystal',x:1480,y:15*32-48},
  {kind:'checkpoint',x:1800,y:15*32-48},
  {kind:'patroller',x:2020,y:15*32-24},
  {kind:'patroller',x:2500,y:15*32-24},
  {kind:'crystal',x:2600,y:15*32-48},
  {kind:'exit',x:2944,y:15*32-64}
 ]
};
