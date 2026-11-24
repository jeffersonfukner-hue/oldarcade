export type Tile=0|1|2;
export type EntityKind='player'|'crystal'|'patroller'|'checkpoint'|'exit'|'boss'|'runner'|'hopper'|'sentry'|'shield'|'heart'|'frenzy'|'updraft';
/** Updrafts are authored as zones, not as a special-case hidden rule in a phase. */
export type Entity={kind:EntityKind;x:number;y:number;width?:number;height?:number;forceX?:number;forceY?:number};
export type Level={id:string;world:string;width:number;height:number;tileSize:32;tiles:Tile[][];entities:Entity[];bossName?:string};
export function tileAt(level:Level,col:number,row:number):Tile {
 if(col<0||col>=level.width||row<0)return 1;
 if(row>=level.height)return 0;
 return level.tiles[row]?.[col]??0;
}
export function validateLevel(level:Level):void {
 if(level.tileSize!==32||level.width<=0||level.height<=0||level.tiles.length!==level.height||level.tiles.some(row=>row.length!==level.width||row.some(tile=>tile!==0&&tile!==1&&tile!==2)))throw Error('Mapa inconsistente');
 for(const kind of ['player','exit'] as const)if(level.entities.filter(entity=>entity.kind===kind).length!==1)throw Error('Mapa precisa de um '+kind);
 if(level.entities.filter(entity=>entity.kind==='boss').length>1)throw Error('Mais de um chefão no nível');
 for(const entity of level.entities){
  if(!Number.isFinite(entity.x)||!Number.isFinite(entity.y)||entity.x<0||entity.y<0||entity.x>=level.width*32||entity.y>=level.height*32)throw Error('Entidade fora do mapa');
  if(tileAt(level,Math.floor(entity.x/32),Math.floor(entity.y/32))===1)throw Error('Entidade dentro de bloco sólido');
  if(entity.kind==='updraft'&&(!(entity.width&&entity.height)||!Number.isFinite(entity.forceX)||!Number.isFinite(entity.forceY)))throw Error('Corrente prismática inválida');
 }
}
