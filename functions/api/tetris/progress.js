import {currentPlayer,reply} from '../_lib/auth.js';
import {completedCampaign,TETRIS_RANK_VERSION} from '../../../src/data/tetrisRanking.js';
export async function onRequestGet(ctx){
 const db=ctx.env?.OLDARCADE_STATS_DB;if(!db)return reply({available:false},503);
 try{
  const player=await currentPlayer(db,ctx.request);if(!player)return reply({error:'Sessão necessária'},401);
  const rows=await db.prepare("SELECT scope FROM tetris_rank_records WHERE version=? AND player_id=? AND scope LIKE 'c%'").bind(TETRIS_RANK_VERSION,player.id).all();
  return reply({available:true,playerId:player.id,completed:completedCampaign((rows.results||[]).map(r=>r.scope))});
 }catch{return reply({available:false},503);}
}
