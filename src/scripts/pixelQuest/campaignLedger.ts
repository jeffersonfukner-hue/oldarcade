import type {LevelResult} from './scoring';
/** Total da campanha inclui pontos da fase em que o jogador perdeu. */
export type CampaignSnapshot={score:number;elapsedMs:number;completedLevels:number;finished:boolean};
export function campaignSnapshot(completed:readonly LevelResult[],current:{score:number;elapsedMs:number}|null,finished:boolean):CampaignSnapshot{
 const unique=new Set(completed.map(result=>result.levelId));
 if(unique.size!==completed.length)throw Error('Fase duplicada');
 if(current&&(!Number.isSafeInteger(current.score)||current.score<0||!Number.isFinite(current.elapsedMs)||current.elapsedMs<0))throw Error('Resultado parcial inválido');
 const score=completed.reduce((sum,result)=>sum+result.score,0)+(current?.score??0);
 const elapsedMs=completed.reduce((sum,result)=>sum+result.elapsedMs,0)+(current?.elapsedMs??0);
 if(!Number.isSafeInteger(score)||!Number.isFinite(elapsedMs))throw Error('Total inválido');
 return {score,elapsedMs,completedLevels:completed.length,finished};
}
