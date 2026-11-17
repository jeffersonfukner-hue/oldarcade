import {currentPlayer,reply,sameOrigin,parseBody,randomToken,digest} from '../_lib/auth.js';
import {dailyMode,dateInSaoPaulo,validDailyDate,dailySeed} from '../../../src/data/dailyChallenges.js';

const validMonth=(month)=>typeof month==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(month);
const dateMonth=(date)=>date.slice(0,7);
const bodyError=(message,status)=>reply({error:message},status);
async function playerAndDb(ctx){
 const db=ctx.env?.OLDARCADE_STATS_DB;
 if(!db)return {error:bodyError('Desafio diário indisponível neste ambiente.',503)};
 try{
  const player=await currentPlayer(db,ctx.request);
  return player?{db,player}:{error:bodyError('Entre na sua conta para participar do desafio diário.',401)};
 }catch{return {error:bodyError('Não foi possível verificar sua conta.',503)}}
}
export async function onRequestGet(ctx){
 const game=String(ctx.params?.game||'');
 if(!dailyMode(game))return bodyError('Jogo sem desafio diário.',404);
 const today=dateInSaoPaulo();
 const month=new URL(ctx.request.url).searchParams.get('month')||dateMonth(today);
 if(!validMonth(month)||month>dateMonth(today))return bodyError('Mês inválido ou ainda não disponível.',400);
 const auth=await playerAndDb(ctx);
 if(auth.error){
  // Visitantes podem ver o calendário público; login é obrigatório para
  // iniciar a partida e consultar a participação pessoal.
  if(auth.error.status===401)return reply({game,today,month,timezone:'America/Sao_Paulo',days:[],account:null});
  return auth.error;
 }
 try{
  const results=await auth.db.prepare(
   'SELECT challenge_date,outcome FROM daily_challenge_attempts WHERE game=? AND player_id=? AND challenge_date>=? AND challenge_date<? ORDER BY challenge_date'
  ).bind(game,auth.player.id,month+'-01',month+'-32').all();
  return reply({game,today,month,timezone:'America/Sao_Paulo',
   days:(results.results||[]).map(row=>({date:row.challenge_date,status:row.outcome})),
   account:{nickname:auth.player.nickname}});
 }catch{return bodyError('Histórico diário indisponível: estrutura ainda não ativada.',503)}
}
export async function onRequestPost(ctx){
 const game=String(ctx.params?.game||'');
 const config=dailyMode(game);if(!config)return bodyError('Jogo sem desafio diário.',404);
 if(!sameOrigin(ctx.request))return bodyError('Origem inválida.',403);
 const auth=await playerAndDb(ctx);if(auth.error)return auth.error;
 const data=await parseBody(ctx.request);
 const today=dateInSaoPaulo(),now=Date.now();
 if(data?.action==='start'){
  if(!validDailyDate(data.date)||data.date!==today)return bodyError('Somente o desafio de hoje pode ser iniciado.',400);
  const token=randomToken(),hash=await digest(token);
  try{
   const result=await auth.db.prepare(
    'INSERT INTO daily_challenge_attempts(game,challenge_date,player_id,seed_version,started_at_ms,attempt_token_hash) VALUES(?,?,?,?,?,?) ON CONFLICT(game,challenge_date,player_id) DO NOTHING'
   ).bind(game,today,auth.player.id,config.seedVersion,now,hash).run();
   if(result.meta?.changes!==1)return bodyError('Você já utilizou sua única tentativa neste desafio.',409);
   return reply({game,date:today,token,seed:dailySeed(game,today,config.seedVersion),
    rules:config.rules,startedAt:now,expiresAt:now+86400000},201);
  }catch{return bodyError('Não foi possível reservar a tentativa. Nenhum jogo deve ser iniciado sem confirmação.',503)}
 }
 if(data?.action==='finish'){
  if(!validDailyDate(data.date)||typeof data.token!=='string'||!/^[a-f0-9]{64}$/.test(data.token))return bodyError('Identificação da tentativa inválida.',400);
  const maxScore=game==='tetris'?100000000:4000;
  const step=game==='tetris'?100:10;
  if(!Number.isSafeInteger(data.score)||data.score<0||data.score>maxScore||data.score%step!==0)return bodyError('Pontuação inválida.',400);
  if(!Number.isSafeInteger(data.durationMs)||data.durationMs<0||data.durationMs>86400000)return bodyError('Duração inválida.',400);
  try{
   const tokenHash=await digest(data.token);
   const result=await auth.db.prepare(
    "UPDATE daily_challenge_attempts SET outcome='finished',score=?,duration_ms=?,finished_at_ms=? WHERE game=? AND challenge_date=? AND player_id=? AND attempt_token_hash=? AND outcome='started' AND started_at_ms<=? AND started_at_ms>=?"
   ).bind(data.score,data.durationMs,now,game,data.date,auth.player.id,tokenHash,now,now-86400000).run();
   if(result.meta?.changes!==1)return bodyError('Tentativa já concluída, expirada ou pertencente a outra conta.',409);
   return reply({saved:true,date:data.date,score:data.score,durationMs:data.durationMs});
  }catch{return bodyError('Não foi possível confirmar o resultado. Reenvie a mesma tentativa sem iniciar outra.',503)}
 }
 return bodyError('Operação desconhecida.',400);
}
