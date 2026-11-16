import {currentPlayer,reply,sameOrigin,parseBody} from '../../_lib/auth.js';
async function standings(db,request){
 const result=await db.prepare(
  'SELECT a.nickname,r.best_score,r.achieved_at_ms FROM player_game_records r JOIN player_accounts a ON a.id=r.player_id WHERE r.game=? ORDER BY r.best_score DESC,r.achieved_at_ms ASC,r.player_id ASC LIMIT 10'
 ).bind('snake').all();
 const scores=new Map();
 const top=(result.results||[]).map((row,i)=>{
  const score=row.best_score;
  if(!scores.has(score))scores.set(score,scores.size+1);
  return {nickname:row.nickname,score,place:scores.get(score),rank:i+1,achievedAt:new Date(row.achieved_at_ms).toISOString()};
 });
 const player=await currentPlayer(db,request);
 let mine=null;
 if(player){
  const own=await db.prepare('SELECT best_score,achieved_at_ms FROM player_game_records WHERE game=? AND player_id=?').bind('snake',player.id).first();
  if(own){
   const ahead=await db.prepare(
    'SELECT COUNT(*) AS count FROM player_game_records WHERE game=? AND (best_score>? OR (best_score=? AND (achieved_at_ms<? OR (achieved_at_ms=? AND player_id<?))))'
   ).bind('snake',own.best_score,own.best_score,own.achieved_at_ms,own.achieved_at_ms,player.id).first();
   mine={nickname:player.nickname,score:own.best_score,rank:Number(ahead?.count||0)+1,achievedAt:new Date(own.achieved_at_ms).toISOString()};
  }
 }
 return {available:true,top,mine,serverNow:new Date().toISOString(),verified:false,registeredOnly:true};
}
export async function onRequestGet(ctx){
 if(ctx.params?.game!=='snake')return reply({error:'Jogo não encontrado'},404);
 const db=ctx.env?.OLDARCADE_STATS_DB;if(!db)return reply({available:false,error:'Ranking indisponível'},503);
 try{return reply(await standings(db,ctx.request))}
 catch{return reply({available:false,error:'Ranking indisponível'},503)}
}
export async function onRequestPost(ctx){
 if(ctx.params?.game!=='snake')return reply({error:'Jogo não encontrado'},404);
 if(!sameOrigin(ctx.request))return reply({error:'Origem inválida'},403);
 const db=ctx.env?.OLDARCADE_STATS_DB;if(!db)return reply({available:false,error:'Ranking indisponível'},503);
 const data=await parseBody(ctx.request);
 if(!Number.isSafeInteger(data?.score)||data.score<0||data.score>4000||data.score%10!==0)return reply({error:'Pontuação inválida'},400);
 try{
  const player=await currentPlayer(db,ctx.request);
  if(!player)return reply({error:'Entre ou crie uma conta para registrar recordes'},401);
  const now=Date.now();
  // Atualização condicional: score menor ou igual nunca altera o instante da conquista.
  await db.prepare(
   'INSERT INTO player_game_records(game,player_id,best_score,achieved_at_ms) VALUES (?,?,?,?) ON CONFLICT(game,player_id) DO UPDATE SET best_score=excluded.best_score,achieved_at_ms=excluded.achieved_at_ms WHERE excluded.best_score>player_game_records.best_score'
  ).bind('snake',player.id,data.score,now).run();
  return reply(await standings(db,ctx.request));
 }catch{return reply({available:false,error:'Falha ao registrar recorde'},503)}
}
