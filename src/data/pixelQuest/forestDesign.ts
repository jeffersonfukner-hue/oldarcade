import type {Level,Tile,Entity} from '../../scripts/pixelQuest/levels';

/** Mapas do Mundo 1: terrenos variados, abismos e plataformas unidirecionais. */
type Ledge={from:number;to:number;row:12|13|14};
type Crystal={col:number;row?:12|13|14};
type Plan={id:'1-1'|'1-2'|'1-3';width:number;gaps:[number,number][];ledges:Ledge[];crystals:Crystal[];enemies:number[];checkpoint:number;boss?:number};
const plans:Record<Plan['id'],Plan>={
 '1-1':{
  id:'1-1',width:300,
  gaps:[[48,50],[99,102],[167,170],[241,243]],
  ledges:[
   {from:17,to:24,row:14},{from:27,to:31,row:13},
   {from:58,to:64,row:13},{from:69,to:73,row:12},
   {from:109,to:116,row:14},{from:129,to:133,row:12},
   {from:180,to:187,row:13},{from:194,to:200,row:12},
   {from:226,to:231,row:14},{from:258,to:266,row:13}
  ],
  crystals:[{col:8},{col:22,row:14},{col:30,row:13},{col:61,row:13},{col:72,row:12},
   {col:91},{col:112,row:14},{col:132,row:12},{col:151},{col:185,row:13},
   {col:213},{col:230,row:14},{col:260,row:13},{col:285}],
  enemies:[38,82,143,192,221,274],checkpoint:154
 },
 '1-2':{
  id:'1-2',width:366,
  gaps:[[41,44],[112,115],[177,180],[249,251],[317,320]],
  ledges:[
   {from:15,to:21,row:14},{from:29,to:36,row:12},
   {from:53,to:60,row:13},{from:66,to:71,row:12},
   {from:89,to:94,row:14},{from:121,to:129,row:13},{from:136,to:140,row:12},
   {from:159,to:166,row:14},{from:188,to:194,row:13},{from:203,to:207,row:12},
   {from:230,to:238,row:14},{from:259,to:265,row:13},
   {from:277,to:281,row:12},{from:304,to:310,row:13},
   {from:328,to:337,row:14}
  ],
  crystals:[{col:10},{col:19,row:14},{col:33,row:12},{col:56,row:13},
   {col:70,row:12},{col:88},{col:126,row:13},{col:139,row:12},{col:162,row:14},
   {col:191,row:13},{col:205,row:12},{col:233,row:14},{col:263,row:13},
   {col:280,row:12},{col:307,row:13},{col:334,row:14},{col:351}],
  enemies:[24,77,103,146,172,215,246,292,344],checkpoint:183
 },
 '1-3':{
  id:'1-3',width:425,
  gaps:[[38,41],[104,107],[163,166],[222,225],[286,289],[334,337]],
  ledges:[
   {from:14,to:21,row:14},{from:25,to:30,row:12},
   {from:49,to:54,row:13},{from:63,to:69,row:12},
   {from:85,to:91,row:14},{from:114,to:121,row:13},{from:127,to:132,row:12},
   {from:148,to:156,row:14},{from:177,to:185,row:13},{from:193,to:199,row:12},
   {from:212,to:218,row:14},{from:236,to:244,row:13},
   {from:251,to:258,row:12},{from:274,to:279,row:14},
   {from:298,to:302,row:13},{from:312,to:318,row:12},
   {from:345,to:353,row:14},{from:357,to:364,row:13}
  ],
  crystals:[{col:8},{col:18,row:14},{col:28,row:12},{col:51,row:13},{col:67,row:12},
   {col:97},{col:118,row:13},{col:130,row:12},{col:151,row:14},{col:180,row:13},
   {col:196,row:12},{col:215,row:14},{col:240,row:13},{col:255,row:12},
   {col:277,row:14},{col:301,row:13},{col:315,row:12},{col:350,row:14},{col:362,row:13}],
  enemies:[35,76,96,139,171,210,246,272,304,327,371],checkpoint:293,boss:400
 }
};
const groundRow=15;
export function createForestLevel(id:Plan['id']):Level{
 const plan=plans[id],height=18;
 const tiles:Tile[][]=Array.from({length:height},()=>Array<Tile>(plan.width).fill(0));
 for(let row=groundRow;row<height;row++)tiles[row].fill(1);
 for(const [a,b] of plan.gaps)for(let x=a;x<=b;x++)for(let row=groundRow;row<height;row++)tiles[row][x]=0;
 for(const ledge of plan.ledges)for(let x=ledge.from;x<=ledge.to;x++)tiles[ledge.row][x]=2;
 const ground=groundRow*32;
 const entities:Entity[]=[{kind:'player',x:64,y:ground-29}];
 for(const crystal of plan.crystals){
  const support=crystal.row??groundRow;
  entities.push({kind:'crystal',x:crystal.col*32+7,y:support*32-25});
 }
 for(const col of plan.enemies)entities.push({kind:'patroller',x:col*32,y:ground-24});
 entities.push({kind:'checkpoint',x:plan.checkpoint*32,y:ground-48});
 if(plan.boss!==undefined)entities.push({kind:'boss',x:plan.boss*32,y:ground-56});
 entities.push({kind:'exit',x:(plan.width-3)*32,y:ground-64});
 return {id,world:'Floresta Esmeralda',width:plan.width,height,tileSize:32,tiles,entities};
}
export function forestLayoutAudit(level:Level):string[]{
 const issues:string[]=[];
 const plan=plans[level.id as Plan['id']];
 if(!plan)return ['Fase desconhecida'];
 for(const [a,b] of plan.gaps)if(b-a+1>4)issues.push('Abismo sem margem de segurança');
 for(const entity of level.entities){
  const col=Math.floor(entity.x/32);
  if(entity.kind==='patroller'&&[12,13,14].some(row=>level.tiles[row][col]!==0))issues.push('Patrulheiro sob plataforma');
  if(entity.kind==='crystal'&&level.tiles[Math.floor(entity.y/32)][col]===1)issues.push('Cristal dentro de bloco');
 }
 return issues;
}
