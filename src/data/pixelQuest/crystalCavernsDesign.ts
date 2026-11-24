import type {Entity,Level,Tile} from '../../scripts/pixelQuest/levels';

type Ledge={from:number;to:number;row:number};
type Draft={col:number;row:number;width:number;height:number;forceX?:number;forceY?:number};
type Plan={id:'2-1'|'2-2'|'2-3';width:number;gaps:[number,number][];ledges:Ledge[];crystals:[number,number][];enemies:[number,'patroller'|'runner'|'hopper'|'sentry',number?][];drafts:Draft[];checkpoint:number;boss?:number};

/** Mundo 2: o jogador aprende a ler e usar o ar cristalizado antes de combinar correntes. */
const plans:Record<Plan['id'],Plan>={
 '2-1':{id:'2-1',width:330,gaps:[[46,49],[112,116],[202,206]],ledges:[
  {from:18,to:25,row:14},{from:31,to:37,row:12},{from:54,to:61,row:13},{from:68,to:74,row:10},{from:78,to:84,row:8},
  {from:98,to:105,row:14},{from:121,to:129,row:12},{from:137,to:145,row:9},{from:153,to:160,row:11},{from:174,to:181,row:13},
  {from:211,to:218,row:13},{from:224,to:231,row:10},{from:238,to:246,row:8},{from:260,to:268,row:13},{from:284,to:292,row:11}],
  crystals:[[9,14],[23,14],[34,12],[58,13],[73,10],[82,8],[103,14],[126,12],[142,9],[158,11],[178,13],[215,13],[228,10],[242,8],[266,13],[289,11],[314,14]],
  enemies:[[39,'runner'],[91,'hopper'],[151,'sentry',11],[190,'runner'],[255,'hopper'],[301,'sentry',14]],
  drafts:[{col:64,row:8,width:64,height:224,forceY:-690},{col:218,row:7,width:64,height:256,forceY:-720}],checkpoint:166},
 '2-2':{id:'2-2',width:390,gaps:[[37,41],[94,98],[168,172],[252,257],[326,330]],ledges:[
  {from:14,to:20,row:14},{from:25,to:31,row:12},{from:47,to:54,row:13},{from:59,to:65,row:10},{from:69,to:75,row:8},
  {from:84,to:90,row:14},{from:104,to:111,row:13},{from:117,to:124,row:10},{from:131,to:138,row:8},{from:148,to:155,row:11},
  {from:178,to:185,row:13},{from:193,to:200,row:10},{from:208,to:215,row:8},{from:226,to:234,row:12},{from:263,to:270,row:13},
  {from:278,to:285,row:10},{from:293,to:300,row:8},{from:309,to:316,row:11},{from:337,to:345,row:13},{from:357,to:366,row:10}],
  crystals:[[8,14],[18,14],[29,12],[51,13],[63,10],[73,8],[88,14],[108,13],[121,10],[135,8],[152,11],[182,13],[197,10],[211,8],[231,12],[267,13],[281,10],[296,8],[313,11],[341,13],[362,10],[379,14]],
  enemies:[[34,'runner'],[57,'hopper'],[119,'sentry',10],[145,'runner'],[182,'hopper'],[215,'sentry',8],[244,'runner'],[280,'hopper'],[315,'sentry',11],[351,'runner']],
  drafts:[{col:55,row:7,width:62,height:256,forceY:-700},{col:188,row:7,width:62,height:256,forceY:-700},{col:276,row:7,width:72,height:256,forceX:160,forceY:-650}],checkpoint:220},
 '2-3':{id:'2-3',width:450,gaps:[[42,46],[105,110],[176,181],[250,256],[337,342]],ledges:[
  {from:15,to:22,row:14},{from:28,to:35,row:12},{from:53,to:60,row:13},{from:66,to:72,row:10},{from:78,to:85,row:8},{from:93,to:100,row:11},
  {from:116,to:123,row:13},{from:130,to:137,row:10},{from:144,to:151,row:8},{from:160,to:168,row:12},{from:187,to:195,row:13},{from:202,to:210,row:10},
  {from:218,to:226,row:8},{from:234,to:242,row:11},{from:262,to:270,row:13},{from:278,to:286,row:10},{from:294,to:302,row:8},{from:312,to:320,row:12},
  {from:347,to:355,row:13},{from:363,to:371,row:10},{from:379,to:388,row:8},{from:398,to:407,row:12}],
  crystals:[[9,14],[20,14],[32,12],[56,13],[69,10],[82,8],[96,11],[120,13],[134,10],[148,8],[164,12],[191,13],[206,10],[222,8],[238,11],[266,13],[282,10],[298,8],[316,12],[351,13],[366,10],[383,8],[402,12],[430,14]],
  enemies:[[37,'runner'],[70,'hopper'],[98,'sentry',11],[126,'runner'],[163,'hopper'],[205,'sentry',10],[239,'runner'],[281,'hopper'],[316,'sentry',12],[354,'runner'],[383,'hopper']],
  drafts:[{col:64,row:7,width:64,height:256,forceY:-720},{col:202,row:7,width:64,height:256,forceX:-145,forceY:-690},{col:365,row:7,width:70,height:256,forceY:-740}],checkpoint:286,boss:417}
};
const groundRow=15;
export function createCrystalCavernsLevel(id:Plan['id']):Level{
 const plan=plans[id],height=18,tiles:Tile[][]=Array.from({length:height},()=>Array<Tile>(plan.width).fill(0));
 for(let row=groundRow;row<height;row++)tiles[row].fill(1);
 for(const [from,to] of plan.gaps)for(let col=from;col<=to;col++)for(let row=groundRow;row<height;row++)tiles[row][col]=0;
 for(const ledge of plan.ledges)for(let col=ledge.from;col<=ledge.to;col++)tiles[ledge.row][col]=2;
 const ground=groundRow*32,entities:Entity[]=[{kind:'player',x:64,y:ground-29}];
 for(const [col,row] of plan.crystals)entities.push({kind:'crystal',x:col*32+7,y:row*32-25});
 for(const [col,kind,row] of plan.enemies)entities.push({kind,x:col*32,y:(row??groundRow)*32-24});
 for(const draft of plan.drafts)entities.push({kind:'updraft',x:draft.col*32,y:draft.row*32,width:draft.width,height:draft.height,forceX:draft.forceX??0,forceY:draft.forceY??-700});
 entities.push({kind:'checkpoint',x:plan.checkpoint*32,y:ground-48});
 if(plan.boss!==undefined)entities.push({kind:'boss',x:plan.boss*32,y:ground-56});
 entities.push({kind:'exit',x:(plan.width-3)*32,y:ground-64});
 return {id,world:'Cavernas de Cristal',width:plan.width,height,tileSize:32,tiles,entities,bossName:plan.boss?'GUARDIÃO PRISMÁTICO':undefined};
}
export function crystalCavernsLayoutAudit(level:Level):string[]{
 const issues:string[]=[];
 for(const entity of level.entities){
  const col=Math.floor(entity.x/32);
  if(entity.kind==='crystal'&&level.tiles[Math.floor(entity.y/32)][col]===1)issues.push('Cristal dentro de bloco');
  if(entity.kind==='updraft'&&(!entity.width||!entity.height||entity.y+entity.height>15*32))issues.push('Corrente fora da caverna');
 }
 return issues;
}
