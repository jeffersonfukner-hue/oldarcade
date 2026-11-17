import {currentPlayer,reply,sameOrigin,parseBody} from '../../_lib/auth.js';
import {competitiveGame,validGameScore} from '../../../../src/data/gameModes.js';
export {validGameScore} from '../../../../src/data/gameModes.js';
async function scoreColumn(db){
 const schema=await db.prepare("PRAGMA table_info('player_game_records')").all();
 return (schema.results||[]).some(row=>row.name==='best_score_milli')?'best_score_milli':'best_score';
}
async function standings(db,request,game){
 const column=await scoreColumn(db),factor=column==='best_score_milli'?1000:1;
 const result=await db.prepare(
  `SELECT a.nickname,r.${column} AS score_units,r.achieved_at_ms,r.duration_ms FROM player_game_records r JOIN player_accounts a ON a.id=r.player_id WHERE r.game=? ORDER BY r.${column} DESC,r.duration_ms IS NULL ASC,r.duration_ms ASC,r.achieved_at_ms ASC,r.player_id ASC LIMIT 10`
 ).bind(game).all();
 const scores=new Map();
 const top=(result.results||[]).map((row,i)=>{
  const score=row.score_units/factor;
  if(!scores.has(score))scores.set(score,scores.size+1);
  return {nickname:row.nickname,score,place:scores.get(score),rank:i+1,durationMs:row.duration_ms===null?null:Number(row.duration_ms),achievedAt:new Date(row.achieved_at_ms).toISOString()};
 });
 const player=await currentPlayer(db,request);
 let mine=null;
 let myGames=[];
 if(player){
  const records=await db.prepare(`SELECT game,${column} AS score_units FROM player_game_records WHERE player_id=? ORDER BY game`).bind(player.id).all();
  myGames=(records.results||[]).map(row=>({game:String(row.game),score:Number(row.score_units)/factor})).filter(row=>Number.isFinite(row.score)&&row.score>=0);
  const own=await db.prepare(`SELECT ${column} AS score_units,achieved_at_ms,duration_ms FROM player_game_records WHERE game=? AND player_id=?`).bind(game,player.id).first();
  if(own){
   const ahead=await db.prepare(
    `SELECT COUNT(*) AS count FROM player_game_records WHERE game=? AND (${column}>? OR (${column}=? AND (duration_ms IS NOT NULL AND ? IS NULL OR (duration_ms IS NOT NULL AND ? IS NOT NULL AND duration_ms<?) OR ((duration_ms=? OR (duration_ms IS NULL AND ? IS NULL)) AND (achieved_at_ms<? OR (achieved_at_ms=? AND player_id<?))))))`
   ).bind(game,own.score_units,own.score_units,own.duration_ms,own.duration_ms,own.duration_ms,own.duration_ms,own.duration_ms,own.achieved_at_ms,own.achieved_at_ms,player.id).first();
   mine={nickname:player.nickname,score:own.score_units/factor,rank:Number(ahead?.count||0)+1,durationMs:own.duration_ms===null?null:Number(own.duration_ms),achievedAt:new Date(own.achieved_at_ms).toISOString()};
  }
 }
 return {available:true,top,mine,myGames,serverNow:new Date().toISOString(),verified:false,registeredOnly:true};
}
export async function onRequestGet(ctx){
 if(!competitiveGame(String(ctx.params?.game||'')))return reply({error:'Jogo não encontrado'},404);
 const db=ctx.env?.OLDARCADE_STATS_DB;if(!db)return reply({available:false,error:'Ranking indisponível'},503);
 try{return reply(await standings(db,ctx.request,String(ctx.params.game)))}
 catch{return reply({available:false,error:'Ranking indisponível'},503)}
}
export async function onRequestPost(ctx){
 if(!competitiveGame(String(ctx.params?.game||'')))return reply({error:'Jogo não encontrado'},404);
 if(!sameOrigin(ctx.request))return reply({error:'Origem inválida'},403);
 const db=ctx.env?.OLDARCADE_STATS_DB;if(!db)return reply({available:false,error:'Ranking indisponível'},503);
 const data=await parseBody(ctx.request);
 const game=String(ctx.params.game);
 // Contrato global: até 3 casas decimais; cada jogo calcula sua própria pontuação.
 if(!validGameScore(game,data?.score))return reply({error:'Pontuação inválida'},400);
 if(!Number.isSafeInteger(data?.durationMs)||data.durationMs<0||data.durationMs>86400000)return reply({error:'Duração inválida'},400);
 let player;
 try{player=await currentPlayer(db,ctx.request)}
 catch(error){console.error('leaderboard.auth',error);return reply({available:false,code:'AUTH_LOOKUP_FAILED',error:'Não foi possível verificar sua sessão. Tente novamente.'},503)}
 if(!player)return reply({error:'Entre ou crie uma conta para registrar recordes'},401);
 const column=await scoreColumn(db);
 if(column!=='best_score_milli'&&data.score%1!==0)return reply({available:false,saved:false,code:'DECIMAL_MIGRATION_PENDING',error:'Pontuações decimais aguardam migração do banco Preview.'},503);
 const units=column==='best_score_milli'?Math.round(data.score*1000):data.score;
 const now=Date.now();
 try{
  const result=await db.prepare(
   `INSERT INTO player_game_records(game,player_id,${column},achieved_at_ms,duration_ms) VALUES (?,?,?,?,?) ON CONFLICT(game,player_id) DO UPDATE SET ${column}=excluded.${column},achieved_at_ms=excluded.achieved_at_ms,duration_ms=excluded.duration_ms WHERE excluded.${column}>player_game_records.${column} OR (excluded.${column}=player_game_records.${column} AND (player_game_records.duration_ms IS NULL OR excluded.duration_ms<player_game_records.duration_ms))`
  ).bind(game,player.id,units,now,data.durationMs).run();
  if(result?.success===false)throw Error('D1 returned success=false');
 }catch(error){
  console.error('leaderboard.write',error);
  return reply({available:false,saved:false,code:'RECORD_WRITE_FAILED',error:'O banco não confirmou a gravação do recorde. Não envie novamente até verificar o ranking.'},503);
 }
 try{
  const board=await standings(db,ctx.request,game);
  return reply({...board,saved:true});
 }catch(error){
  console.error('leaderboard.read_after_write',error);
  return reply({available:false,saved:true,code:'RANKING_REFRESH_FAILED',error:'O banco aceitou a gravação, mas não foi possível atualizar o ranking. Consulte novamente antes de reenviar.'},503);
 }
}
