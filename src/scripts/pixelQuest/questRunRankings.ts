import {podiumAtStart,personalAtStart,verifiedRankMessage,type RankingSnapshot} from './rankingMilestones';
export type QuestRankingScope='fase'|'total';
export type QuestMilestone={scope:QuestRankingScope;rank:1|2|3|null;message:string;detail:string};
type Baseline={board:RankingSnapshot|null;local:number|null;rank:1|2|3|null;personalShown:boolean};
const empty=():Baseline=>({board:null,local:null,rank:null,personalShown:false});
function validBoard(raw:unknown):RankingSnapshot|null{
 if(!raw||typeof raw!=='object')return null;
 const data=raw as RankingSnapshot;
 if(data.available!==true||!Array.isArray(data.top)||!data.top.every(e=>e&&Number.isFinite(e.score)&&e.score>=0))return null;
 if(data.mine&&(!Number.isFinite(data.mine.score)||data.mine.score<0))return null;
 return {available:true,top:data.top.map(row=>({nickname:row.nickname,score:row.score,rank:row.rank})),
  mine:data.mine?{nickname:data.mine.nickname,score:data.mine.score,rank:data.mine.rank}:null};
}
/** Uma fotografia por rodada; nunca substitui o referencial por resultados mais recentes durante o jogo. */
export function setupQuestRunRankings(onCelebrate:(milestone:QuestMilestone)=>void,onResult:(message:string)=>void){
 let token=0,phaseId='',finished=false,completedPhaseScore:number|null=null,completedTotalScore:number|null=null;
 let latestPhaseScore=0,latestTotalScore=0;
 const baselines:Record<QuestRankingScope,Baseline>={fase:empty(),total:empty()};
 const get=(scope:QuestRankingScope)=>baselines[scope];
 function begin(id:string,localPhase:number|null,localTotal:number|null){
  token++;phaseId=id;finished=false;completedPhaseScore=null;completedTotalScore=null;
  latestPhaseScore=0;latestTotalScore=0;
  baselines.fase={...empty(),local:localPhase};
  baselines.total={...empty(),local:localTotal};
  const current=token;
  for(const scope of ['fase','total'] as const){
   const endpoint='/api/quest/rankings/'+encodeURIComponent(scope==='fase'?id:'total');
   void fetch(endpoint,{cache:'no-store'}).then(async response=>{
    if(!response.ok)return;
    const board=validBoard(await response.json());
    if(current===token&&!finished){baselines[scope].board=board;score(latestPhaseScore,latestTotalScore)}
   }).catch(()=>{/* Sem dados não há promessa de pódio */});
  }
 }
 function score(currentPhase:number,currentTotal:number){
  if(finished)return;
  latestPhaseScore=currentPhase;latestTotalScore=currentTotal;
  for(const scope of ['total','fase'] as const){
   const state=get(scope),points=scope==='fase'?currentPhase:currentTotal;
   if(!Number.isSafeInteger(points)||points<=0)continue;
   const personal=personalAtStart(points,state.board,state.local);
   if(personal&&!state.personalShown){
    state.personalShown=true;
    onCelebrate({scope,rank:null,message:'NOVO RECORDE PESSOAL!',detail:'Pontuação provisória · '+(scope==='fase'?'fase':'campanha')});
   }
   // Se já tinha um recorde maior, não atribuir uma nova conquista de pódio.
   if(state.board?.mine&&points<=state.board.mine.score)continue;
   const rank=podiumAtStart(points,state.board);
   if(rank!==null&&(state.rank===null||rank<state.rank)){
    state.rank=rank;
    const message=rank===1?'1º LUGAR!':rank===2?'EXCELENTE! 2º LUGAR':'BOA POSIÇÃO! 3º LUGAR';
    onCelebrate({scope,rank,message,detail:'Pódio provisório contra o início da partida · '+scope});
   }
  }
 }
 function end(id:string,phaseScore:number,totalScore:number){
  if(id!==phaseId)return;
  finished=true;completedPhaseScore=phaseScore;completedTotalScore=totalScore;
 }
 function confirm(scope:QuestRankingScope,score:number,mine:{rank?:number;score:number}|null|undefined){
  if(!finished||score!==(scope==='fase'?completedPhaseScore:completedTotalScore))return;
  const state=get(scope);
  const rank=mine?.score===score&&Number.isSafeInteger(mine.rank)?Number(mine.rank):null;
  if(rank===null){
   onResult('Resultado consultado, mas sua posição para esta tentativa não pôde ser confirmada.');
   return;
  }
  onResult((scope==='fase'?'Ranking da fase: ':'Ranking geral: ')+verifiedRankMessage(state.rank,rank));
 }
 function dispose(){token++;finished=true}
 return {begin,score,end,confirm,dispose};
}
