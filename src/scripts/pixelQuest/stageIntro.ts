/** Apresentação da fase, independente da contagem global 3-2-1. */
export type Entrance='zoom'|'horizontal'|'vertical';
export const STAGE_INTRO_MS=1800;
export function entranceForLevel(index:number):Entrance {
 return (['zoom','horizontal','vertical'] as const)[index]??'zoom';
}
export function stageTitle(levelId:string,levelNumber:number,total:number,world:string){
 const worldNumber=levelId.split('-')[0]??'1';
 return {world:`MUNDO ${worldNumber} · ${world.toUpperCase()}`,progress:`Fase ${levelNumber}/${total}`,code:levelId};
}
