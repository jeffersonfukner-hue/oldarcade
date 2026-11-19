/** Pixel Quest — pontuação v1 (provisória, apenas Preview; não misturar rankings entre versões). */
export const SCORE_RULE_VERSION='pq-v1';
export const CRYSTAL_POINTS=10;
export const ENEMY_POINTS=50;
export const PORTAL_POINTS=100;
export const MAX_TIME_BONUS=500;
export function timeBonus(elapsedMs:number):number{
 if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw Error('Tempo inválido');
 return Math.max(0,MAX_TIME_BONUS-2*Math.floor(elapsedMs/1000));
}
export type LevelResult={levelId:string;score:number;elapsedMs:number;crystals:number;enemies:number};
export function calculateCompletedLevel(levelId:string,crystals:number,enemies:number,elapsedMs:number):LevelResult{
 if(!levelId||![crystals,enemies].every(n=>Number.isSafeInteger(n)&&n>=0))throw Error('Resultado inválido');
 const score=crystals*CRYSTAL_POINTS+enemies*ENEMY_POINTS+PORTAL_POINTS+timeBonus(elapsedMs);
 return {levelId,score,elapsedMs,crystals,enemies};
}
export function campaignScore(levelResults:readonly LevelResult[]):number{
 const unique=new Set(levelResults.map(result=>result.levelId));
 if(unique.size!==levelResults.length)throw Error('Nível duplicado na campanha');
 return levelResults.reduce((sum,result)=>sum+result.score,0);
}
