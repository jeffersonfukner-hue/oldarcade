import {currentPlayer,reply,sameOrigin,parseBody} from '../../_lib/auth.js';
const eligibleGames=new Set(['snake','snake-adventure']);
export function validGameScore(game,score){
 const scoreStep=game==='snake-adventure'?5:10;
 return eligibleGames.has(game)&&Number.isSafeInteger(score)&&score>=0&&score<=4000&&score%scoreStep===0;
}
async function standings(db,request,game){
 const result=await db.prepare(
  'SELECT a.nickname,r.best_score,r.achieved_at_ms FROM player_game_records r JOIN player_accounts a ON a.id=r.player_id WHERE r.game=? ORDER BY r.best_score DESC,r.achieved_at_ms ASC,r.player_id ASC LIMIT 10'
 ).bind(game).all();
 const scores=new Map();
 const top=(result.results||[]).map((row,i)=>{
  const score=row.best_score;
  if(!scores.has(score))scores.set(score,scores.size+1);
  return {nickname:row.nickname,score,place:scores.get(score),rank:i+1,achievedAt:new Date(row.achieved_at_ms).toISOString()};
 });
 const player=await currentPlayer(db,request);
 let mine=null;
 let myGames=[];
 if(player){
  const records=await db.prepare('SELECT game,best_score FROM player_game_records WHERE player_id=? ORDER BY game').bind(player.id).all();
  myGames=(records.results||[]).map(row=>({game:String(row.game),score:Number(row.best_score)})).filter(row=>Number.isSafeInteger(row.score)&&row.score>=0);
  const own=await db.prepare('SELECT best_score,achieved_at_ms FROM player_game_records WHERE game=? AND player_id=?').bind(game,player.id).first();
  if(own){
   const ahead=await db.prepare(
    'SELECT COUNT(*) AS count FROM player_game_records WHERE game=? AND (best_score>? OR (best_score=? AND (achieved_at_ms<? OR (achieved_at_ms=? AND player_id<?))))'
   ).bind(game,own.best_score,own.best_score,own.achieved_at_ms,own.achieved_at_ms,player.id).first();
   mine={nickname:player.nickname,score:own.best_score,rank:Number(ahead?.count||0)+1,achievedAt:new Date(own.achieved_at_ms).toISOString()};
  }
 }
 return {available:true,top,mine,myGames,serverNow:new Date().toISOString(),verified:false,registeredOnly:true};
}
export async function onRequestGet(ctx){
 if(!eligibleGames.has(String(ctx.params?.game||'')))return reply({error:'Jogo não encontrado'},404);
 const db=ctx.env?.OLDARCADE_STATS_DB;if(!db)return reply({available:false,error:'Ranking indisponível'},503);
 try{return reply(await standings(db,ctx.request,String(ctx.params.game)))}
 catch{return reply({available:false,error:'Ranking indisponível'},503)}
}
export async function onRequestPost(ctx){
 if(!eligibleGames.has(String(ctx.params?.game||'')))return reply({error:'Jogo não encontrado'},404);
 if(!sameOrigin(ctx.request))return reply({error:'Origem inválida'},403);
 const db=ctx.env?.OLDARCADE_STATS_DB;if(!db)return reply({available:false,error:'Ranking indisponível'},503);
 const data=await parseBody(ctx.request);
 const game=String(ctx.params.game);
 // Clássico soma 10 por maçã; Aventura soma 10/50/15/20 conforme os itens.
 if(!validGameScore(game,data?.score))return reply({error:'Pontuação inválida'},400);
 let player;
 try{player=await currentPlayer(db,ctx.request)}
 catch(error){console.error('leaderboard.auth',error);return reply({available:false,code:'AUTH_LOOKUP_FAILED',error:'Não foi possível verificar sua sessão. Tente novamente.'},503)}
 if(!player)return reply({error:'Entre ou crie uma conta para registrar recordes'},401);
 const now=Date.now();
 try{
  const result=await db.prepare(
   'INSERT INTO player_game_records(game,player_id,best_score,achieved_at_ms) VALUES (?,?,?,?) ON CONFLICT(game,player_id) DO UPDATE SET best_score=excluded.best_score,achieved_at_ms=excluded.achieved_at_ms WHERE excluded.best_score>player_game_records.best_score'
  ).bind(game,player.id,data.score,now).run();
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
