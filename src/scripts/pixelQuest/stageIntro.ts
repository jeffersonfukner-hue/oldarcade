/** Apresentação da fase, independente da contagem global 3-2-1. */
export type Entrance='zoom'|'horizontal'|'vertical';
export const STAGE_INTRO_MS=1800;
export function entranceForLevel(index:number):Entrance {
 return (['zoom','horizontal','vertical'] as const)[index]??'zoom';
}
export function stageTitle(levelId:string,levelNumber:number,total:number,world:string){
 return {world:`MUNDO 1 · ${world.toUpperCase()}`,progress:`Fase ${levelNumber}/${total}`,code:levelId};
}
