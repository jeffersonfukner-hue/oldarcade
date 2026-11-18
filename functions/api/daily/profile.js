import {currentPlayer,reply} from '../_lib/auth.js';
import {DAILY_MODES,dailyMission} from '../../../src/data/dailyChallenges.js';
export async function onRequestGet(ctx){
 const db=ctx.env?.OLDARCADE_STATS_DB;
 if(!db)return reply({error:'Histórico diário indisponível.'},503);
 try{
  const player=await currentPlayer(db,ctx.request);
  if(!player)return reply({error:'Entre na conta para consultar seu desempenho.'},401);
  const rows=await db.prepare(
   'SELECT game,challenge_date,outcome,score,duration_ms,started_at_ms,finished_at_ms,seed_version,lines_cleared,mission_success FROM daily_challenge_attempts WHERE player_id=? ORDER BY challenge_date DESC,game LIMIT 365'
  ).bind(player.id).all();
  return reply({account:player.nickname,results:(rows.results||[]).filter(x=>Object.hasOwn(DAILY_MODES,x.game)).map(x=>({
   game:x.game,date:x.challenge_date,status:x.outcome,score:x.score,
   durationMs:x.duration_ms,startedAt:x.started_at_ms,finishedAt:x.finished_at_ms,
   linesCleared:x.lines_cleared,missionSuccess:x.mission_success===null?null:x.mission_success===1,
   mission:dailyMission(x.game,x.challenge_date,x.seed_version)
  }))});
 }catch{return reply({error:'Histórico diário indisponível: estrutura ainda não ativada.'},503)}
}
