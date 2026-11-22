import type {LevelResult} from './scoring';
export type CompletedForestStage=Pick<LevelResult,'levelId'|'score'|'elapsedMs'|'crystals'|'enemies'>;
const ids=['1-1','1-2','1-3'] as const;
export function validateForestProgress(data:unknown):data is {completed:CompletedForestStage[]}{
 if(!data||typeof data!=='object'||!('completed' in data))return false;
 const completed=(data as {completed:unknown}).completed;
 if(!Array.isArray(completed)||completed.length>3)return false;
 return completed.every((item,i)=>{
  if(!item||typeof item!=='object')return false;
  const stage=item as Record<string,unknown>;
  return stage.levelId===ids[i]&&Number.isSafeInteger(stage.score)&&Number(stage.score)>=0&&Number(stage.score)<=10000
   &&typeof stage.elapsedMs==='number'&&Number.isFinite(stage.elapsedMs)&&stage.elapsedMs>=0&&stage.elapsedMs<=86400000
   &&Number.isSafeInteger(stage.crystals)&&Number(stage.crystals)>=0&&Number(stage.crystals)<=40
   &&Number.isSafeInteger(stage.enemies)&&Number(stage.enemies)>=0&&Number(stage.enemies)<=30;
 });
}
