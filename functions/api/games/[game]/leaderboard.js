import {currentPlayer,reply,sameOrigin,parseBody} from '../../../_lib/auth.js';
async function standings(db){
 const result=await db.prepare(
  'SELECT a.nickname,r.best_score,r.achieved_at_ms FROM player_game_records r JOIN player_accounts a ON a.id=r.player_id WHERE r.game=? ORDER BY r.best_score DESC,r.achieved_at_ms ASC,r.player_id ASC LIMIT 10'
 ).bind('snake').all();
 const scores=new Map();
 const top=(result.results||[]).map(row=>{
  const score=row.best_score;
  if(!scores.has(score))scores.set(score,scores.size+1);
  return {nickname:row.nickname,score,place:scores.get(score),achievedAt:new Date(row.achieved_at_ms).toISOString()};
 });
 return {available:true,top,verified:false,registeredOnly:true};
}
export async function onRequestGet(ctx){
 if(ctx.params?.game!=='snake')return reply({error:'Jogo não encontrado'},404);
 const db=ctx.env?.OLDARCADE_STATS_DB;if(!db)return reply({available:false,error:'Ranking indisponível'},503);
 try{return reply(await standings(db))}
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
  return reply(await standings(db));
 }catch{return reply({available:false,error:'Falha ao registrar recorde'},503)}
}
