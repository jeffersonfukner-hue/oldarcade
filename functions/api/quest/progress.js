/** Salvamento de campanha somente para contas autenticadas.
 * Requer migração 0011 antes da publicação desta funcionalidade.
 */
import {currentPlayer,reply,sameOrigin,parseBody} from '../_lib/auth.js';
const ids=['1-1','1-2','1-3','2-1','2-2','2-3'];
function validCompleted(completed){
 if(!Array.isArray(completed)||completed.length>ids.length)return false;
 return completed.every((r,i)=>r&&typeof r==='object'&&r.levelId===ids[i]
  &&Number.isSafeInteger(r.score)&&r.score>=0&&r.score<=1000000
  &&Number.isFinite(r.elapsedMs)&&r.elapsedMs>=0&&r.elapsedMs<=86400000
  &&Number.isSafeInteger(r.crystals)&&r.crystals>=0&&r.crystals<=40
  &&Number.isSafeInteger(r.enemies)&&r.enemies>=0&&r.enemies<=30);
}
async function authenticated(ctx){
 const db=ctx.env?.OLDARCADE_STATS_DB;if(!db)return {error:reply({available:false,error:'Armazenamento indisponível'},503)};
 try{const player=await currentPlayer(db,ctx.request);if(!player)return {error:reply({error:'Faça login para salvar a aventura'},401)};return {db,player}}
 catch{return {error:reply({error:'Não foi possível validar a sessão'},503)}}
}
export async function onRequestGet(ctx){
 const auth=await authenticated(ctx);if(auth.error)return auth.error;
 try{
  const row=await auth.db.prepare('SELECT completed_json FROM player_campaign_progress WHERE player_id=? AND game=?').bind(auth.player.id,'pixel-quest').first();
  if(!row)return reply({available:true,completed:[]});
  const completed=JSON.parse(row.completed_json);
  if(!validCompleted(completed))throw Error('Progresso inválido');
  return reply({available:true,completed});
 }catch(error){console.error('quest.progress.get',error);return reply({available:false,error:'Não foi possível recuperar seu progresso'},503)}
}
export async function onRequestPost(ctx){
 if(!sameOrigin(ctx.request))return reply({error:'Origem inválida'},403);
 const auth=await authenticated(ctx);if(auth.error)return auth.error;
 const data=await parseBody(ctx.request),completed=data?.completed;
 if(!validCompleted(completed))return reply({error:'Progresso inválido'},400);
 const payload=JSON.stringify(completed),now=Date.now();
 try{
  const result=await auth.db.prepare(`INSERT INTO player_campaign_progress(player_id,game,unlocked_stage,completed_json,updated_at_ms)
    VALUES(?,?,?,?,?) ON CONFLICT(player_id,game) DO UPDATE SET
    unlocked_stage=excluded.unlocked_stage,completed_json=excluded.completed_json,updated_at_ms=excluded.updated_at_ms
    WHERE excluded.unlocked_stage>player_campaign_progress.unlocked_stage`)
    .bind(auth.player.id,'pixel-quest',completed.length+1,payload,now).run();
  if(result?.success===false)throw Error('Falha de gravação');
  return reply({available:true,saved:true,completedCount:completed.length});
 }catch(error){console.error('quest.progress.post',error);return reply({available:false,saved:false,error:'Falha ao salvar progresso'},503)}
}
