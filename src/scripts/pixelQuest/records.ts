import {SCORE_RULE_VERSION,type LevelResult,campaignScore} from './scoring';
/** Recordes LOCAIS do protótipo. Não equivale ao ranking oficial autenticado. */
export type LocalRecord={score:number;elapsedMs:number};
const prefix='oldarcade-pixel-quest-'+SCORE_RULE_VERSION+'-';
export function readLocalRecord(key:string):LocalRecord|null{
 try{
  const data=JSON.parse(localStorage.getItem(prefix+key)||'null');
  if(data&&Number.isSafeInteger(data.score)&&data.score>=0&&Number.isFinite(data.elapsedMs)&&data.elapsedMs>=0)return {score:data.score,elapsedMs:data.elapsedMs};
 }catch{}
 return null;
}
export function updateLocalRecord(key:string,next:LocalRecord):LocalRecord{
 const old=readLocalRecord(key);
 if(old&&(old.score>next.score||(old.score===next.score&&old.elapsedMs<=next.elapsedMs)))return old;
 try{localStorage.setItem(prefix+key,JSON.stringify(next))}catch{}
 return next;
}
export function recordCompletedLevel(result:LevelResult,campaignResults:readonly LevelResult[],availableLevelCount:number){
 const level=updateLocalRecord('level-'+result.levelId,result);
 // Ranking geral só representa uma campanha completa. A chave inclui a quantidade de fases
 // para não confundir o protótipo de 1 fase com a campanha futura de 6 fases.
 if(campaignResults.length!==availableLevelCount)return {level,campaign:null};
 const campaign=updateLocalRecord('campaign-'+availableLevelCount,{
  score:campaignScore(campaignResults),
  elapsedMs:campaignResults.reduce((sum,entry)=>sum+entry.elapsedMs,0)
 });
 return {level,campaign};
}
