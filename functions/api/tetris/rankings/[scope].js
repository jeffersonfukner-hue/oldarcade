import {currentPlayer,reply,sameOrigin,parseBody} from '../../_lib/auth.js';
import {TETRIS_RANK_VERSION,tetrisRankOrder,validTetrisResult,completedCampaign} from '../../../../src/data/tetrisRanking.js';
function order(scope){return tetrisRankOrder(scope);}
async function standings(db,request,scope){
 const sort=order(scope).join(',');
 const rows=await db.prepare(`SELECT a.nickname,r.points,r.duration_ms FROM tetris_rank_records r JOIN player_accounts a ON a.id=r.player_id WHERE r.version=? AND r.scope=? ORDER BY ${sort},achieved_at_ms ASC,player_id ASC LIMIT 10`).bind(TETRIS_RANK_VERSION,scope).all();
 const player=await currentPlayer(db,request);
 const own=player?await db.prepare('SELECT points,duration_ms FROM tetris_rank_records WHERE version=? AND scope=? AND player_id=?').bind(TETRIS_RANK_VERSION,scope,player.id).first():null;
 return {available:true,version:TETRIS_RANK_VERSION,scope,top:(rows.results||[]).map((r,i)=>({nickname:r.nickname,points:r.points,durationMs:r.duration_ms,rank:i+1})),mine:own?{points:own.points,durationMs:own.duration_ms}:null,verified:false};
}
export async function onRequestGet(ctx){
 const scope=String(ctx.params.scope||'');
 if(!order(scope))return reply({error:'Classificação inexistente'},404);
 const db=ctx.env?.OLDARCADE_STATS_DB;if(!db)return reply({available:false},503);
 try{return reply(await standings(db,ctx.request,scope));}catch{return reply({available:false},503);}
}
export async function onRequestPost(ctx){
 const scope=String(ctx.params.scope||'');
 if(!order(scope))return reply({error:'Classificação inexistente'},404);
 if(!sameOrigin(ctx.request))return reply({error:'Origem inválida'},403);
 const db=ctx.env?.OLDARCADE_STATS_DB;if(!db)return reply({available:false},503);
 const data=await parseBody(ctx.request);
 if(!validTetrisResult(scope,data))return reply({error:'Resultado inválido'},400);
 try{
  const player=await currentPlayer(db,ctx.request);if(!player)return reply({error:'Entre para registrar'},401);
  if(/^c[1-8]$/.test(scope)){
   const rows=await db.prepare("SELECT scope FROM tetris_rank_records WHERE version=? AND player_id=? AND scope LIKE 'c%'").bind(TETRIS_RANK_VERSION,player.id).all();
   const completed=completedCampaign((rows.results||[]).map(r=>r.scope));
   if(Number(scope.slice(1))>completed.length+1)return reply({error:'Missão ainda bloqueada nesta conta'},409);
  }
  const [primary,secondary]=order(scope).map(x=>x.split(' '));
  const cmp=([column,direction])=>`excluded.${column}${direction==='ASC'?'<':'>'}tetris_rank_records.${column}`;
  const better=`${cmp(primary)} OR (excluded.${primary[0]}=tetris_rank_records.${primary[0]} AND ${cmp(secondary)})`;
  const result=await db.prepare(`INSERT INTO tetris_rank_records(version,scope,player_id,points,duration_ms,achieved_at_ms) VALUES(?,?,?,?,?,?) ON CONFLICT(version,scope,player_id) DO UPDATE SET points=excluded.points,duration_ms=excluded.duration_ms,achieved_at_ms=excluded.achieved_at_ms WHERE ${better}`).bind(TETRIS_RANK_VERSION,scope,player.id,data.points,data.durationMs,Date.now()).run();
  if(result?.success===false)throw Error('write');
  return reply({...await standings(db,ctx.request,scope),saved:true});
 }catch{return reply({available:false},503);}
}
