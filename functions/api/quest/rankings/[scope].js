/** Classificações v2 por fase e total; nunca toca o ranking legado pixel-quest. */
import {currentPlayer,reply,sameOrigin,parseBody} from '../../_lib/auth.js';
const stageIds=new Set(['1-1','1-2','1-3']);
export function keyForScope(scope){
 if(scope==='total')return 'pixel-quest-total-v2';
 return stageIds.has(scope)?'pixel-quest-stage-'+scope+'-v2':null;
}
async function scoreColumn(db){
 const s=await db.prepare("PRAGMA table_info('player_game_records')").all();
 return (s.results||[]).some(row=>row.name==='best_score_milli')?'best_score_milli':'best_score';
}
async function standings(db,request,scope){
 const game=keyForScope(scope),column=await scoreColumn(db),factor=column==='best_score_milli'?1000:1;
 const rows=await db.prepare(`SELECT a.nickname,r.${column} AS score_units,r.achieved_at_ms,r.duration_ms FROM player_game_records r JOIN player_accounts a ON a.id=r.player_id WHERE r.game=? ORDER BY r.${column} DESC,r.duration_ms IS NULL ASC,r.duration_ms ASC,r.achieved_at_ms ASC,r.player_id ASC LIMIT 10`).bind(game).all();
 const top=(rows.results||[]).map((r,i)=>({nickname:r.nickname,score:Number(r.score_units)/factor,rank:i+1,durationMs:r.duration_ms===null?null:Number(r.duration_ms),achievedAt:new Date(r.achieved_at_ms).toISOString()}));
 const player=await currentPlayer(db,request);let mine=null;
 if(player){
  const own=await db.prepare(`SELECT ${column} AS score_units,achieved_at_ms,duration_ms FROM player_game_records WHERE game=? AND player_id=?`).bind(game,player.id).first();
  if(own){
   const ahead=await db.prepare(`SELECT COUNT(*) AS count FROM player_game_records WHERE game=? AND (${column}>? OR (${column}=? AND (duration_ms IS NOT NULL AND ? IS NULL OR (duration_ms IS NOT NULL AND ? IS NOT NULL AND duration_ms<?) OR ((duration_ms=? OR (duration_ms IS NULL AND ? IS NULL)) AND (achieved_at_ms<? OR (achieved_at_ms=? AND player_id<?))))))`)
    .bind(game,own.score_units,own.score_units,own.duration_ms,own.duration_ms,own.duration_ms,own.duration_ms,own.duration_ms,own.achieved_at_ms,own.achieved_at_ms,player.id).first();
   mine={nickname:player.nickname,score:Number(own.score_units)/factor,rank:Number(ahead?.count||0)+1,durationMs:own.duration_ms===null?null:Number(own.duration_ms),achievedAt:new Date(own.achieved_at_ms).toISOString()};
  }
 }
 return {available:true,top,mine,scope,verified:false,registeredOnly:true};
}
export async function onRequestGet(ctx){
 const scope=String(ctx.params?.scope||'');
 if(!keyForScope(scope))return reply({error:'Classificação inexistente'},404);
 const db=ctx.env?.OLDARCADE_STATS_DB;if(!db)return reply({available:false,error:'Ranking indisponível'},503);
 try{return reply(await standings(db,ctx.request,scope))}
 catch(error){console.error('quest.rankings.get',error);return reply({available:false,error:'Ranking indisponível'},503)}
}
export async function onRequestPost(ctx){
 const scope=String(ctx.params?.scope||''),game=keyForScope(scope);
 if(!game)return reply({error:'Classificação inexistente'},404);
 if(!sameOrigin(ctx.request))return reply({error:'Origem inválida'},403);
 const db=ctx.env?.OLDARCADE_STATS_DB;if(!db)return reply({available:false,error:'Ranking indisponível'},503);
 const data=await parseBody(ctx.request);
 if(!Number.isSafeInteger(data?.score)||data.score<0||data.score>1000000)return reply({error:'Pontuação inválida'},400);
 if(!Number.isSafeInteger(data?.durationMs)||data.durationMs<0||data.durationMs>86400000)return reply({error:'Duração inválida'},400);
 let player;
 try{player=await currentPlayer(db,ctx.request)}
 catch{return reply({available:false,error:'Sessão indisponível'},503)}
 if(!player)return reply({error:'Entre ou crie conta para registrar recordes'},401);
 const column=await scoreColumn(db),units=column==='best_score_milli'?data.score*1000:data.score;
 try{
  const write=await db.prepare(`INSERT INTO player_game_records(game,player_id,${column},achieved_at_ms,duration_ms) VALUES (?,?,?,?,?) ON CONFLICT(game,player_id) DO UPDATE SET ${column}=excluded.${column},achieved_at_ms=excluded.achieved_at_ms,duration_ms=excluded.duration_ms WHERE excluded.${column}>player_game_records.${column} OR (excluded.${column}=player_game_records.${column} AND (player_game_records.duration_ms IS NULL OR excluded.duration_ms<player_game_records.duration_ms))`)
   .bind(game,player.id,units,Date.now(),data.durationMs).run();
  if(write?.success===false)throw Error('Falha na gravação');
 }catch(error){console.error('quest.rankings.write',error);return reply({available:false,saved:false,error:'Falha ao salvar resultado'},503)}
 try{return reply({...await standings(db,ctx.request,scope),saved:true})}
 catch{return reply({available:false,saved:true,error:'Gravou, mas não atualizou a consulta'},503)}
}
