import {sessionCookie,reply,sameOrigin,parseBody,randomToken,digest} from '../_lib/auth.js';
import {dailyMode,dateInSaoPaulo,validDailyDate,dailySeed,dailyVersionForDate,dailyMission,dailyMissionWon} from '../../../src/data/dailyChallenges.js';

const validMonth=(month)=>typeof month==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(month);
const dateMonth=(date)=>date.slice(0,7);
const bodyError=(message,status)=>reply({error:message},status);
async function dailyPlayer(db,request){
 const token=sessionCookie(request);
 if(!token)return null;
 return db.prepare('SELECT a.id,a.nickname FROM player_sessions s JOIN player_accounts a ON a.id=s.player_id WHERE s.token_hash=? AND s.expires_at>?')
  .bind(await digest(token),Math.floor(Date.now()/1000)).first();
}
async function playerAndDb(ctx){
 const db=ctx.env?.OLDARCADE_STATS_DB;
 if(!db)return {error:bodyError('Desafio diário indisponível neste ambiente.',503)};
 try{
  const player=await dailyPlayer(db,ctx.request);
  return player?{db,player}:{error:bodyError('Entre na sua conta para participar do desafio diário.',401)};
 }catch{return {error:bodyError('Não foi possível verificar sua conta.',503)}}
}
export async function onRequestGet(ctx){
 const game=String(ctx.params?.game||'');
 if(!dailyMode(game))return bodyError('Jogo sem desafio diário.',404);
 const today=dateInSaoPaulo();
 const month=new URL(ctx.request.url).searchParams.get('month')||dateMonth(today);
 if(!validMonth(month)||month>dateMonth(today))return bodyError('Mês inválido ou ainda não disponível.',400);
 const publicCalendar={game,today,month,timezone:'America/Sao_Paulo',days:[],account:null,mission:dailyMission(game,today)};
 const db=ctx.env?.OLDARCADE_STATS_DB;
 if(!db)return reply({...publicCalendar,historyAvailable:false,error:'Serviço de desafios temporariamente indisponível.'});
 // Carregar o calendário não pode depender da tabela de tentativas nem das
 // preferências opcionais de e-mail da conta. O login é identificado pela
 // sessão já existente, com somente as duas colunas necessárias.
 let player=null;
 try{
  player=await dailyPlayer(db,ctx.request); }catch{
  return reply({...publicCalendar,historyAvailable:false,error:'Não foi possível verificar a sessão. Tente novamente.'});
 }
 if(!player)return reply(publicCalendar);
 try{
  const results=await db.prepare(
   'SELECT challenge_date,outcome,score,duration_ms,seed_version,lines_cleared,mission_success FROM daily_challenge_attempts WHERE game=? AND player_id=? AND challenge_date>=? AND challenge_date<? ORDER BY challenge_date'
  ).bind(game,player.id,month+'-01',month+'-32').all();
  return reply({...publicCalendar,
   days:(results.results||[]).map(row=>({date:row.challenge_date,status:row.outcome,score:row.outcome==='finished'?row.score:null,durationMs:row.outcome==='finished'?row.duration_ms:null,linesCleared:row.outcome==='finished'?row.lines_cleared:null,missionSuccess:row.outcome==='finished'?row.mission_success===null?null:row.mission_success===1:null,version:row.seed_version})),
   account:{nickname:player.nickname},historyAvailable:true});
 }catch(cause){
  // O erro anterior ocultava se o problema era tabela ausente ou falha de
  // consulta. Diagnóstico não expõe SQL, credenciais ou dados de terceiros.
  const missingTable=/no such table: (?:main\.)?daily_challenge_attempts/i.test(String(cause?.message||cause));
  console.error('[daily-calendar] Falha ao consultar desafios', {
   game,month,code:missingTable?'SCHEMA_MISSING':'HISTORY_QUERY_FAILED',
   message:String(cause?.message||cause).slice(0,280)
  });
  // Nunca reabrir tentativa única com base em uma consulta incompleta.
  return reply({...publicCalendar,account:{nickname:player.nickname},historyAvailable:false,
   errorCode:missingTable?'SCHEMA_MISSING':'HISTORY_QUERY_FAILED',
   error:missingTable
    ?'A tabela de desafios diários não foi encontrada no banco conectado a este Preview. É necessário conferir a conexão do D1 antes de liberar a tentativa.'
    :'Não foi possível consultar suas tentativas neste momento. Sua participação não foi alterada.'});
 }
}
export async function onRequestPost(ctx){
 const game=String(ctx.params?.game||'');
 const config=dailyMode(game);if(!config)return bodyError('Jogo sem desafio diário.',404);
 if(!sameOrigin(ctx.request))return bodyError('Origem inválida.',403);
 const auth=await playerAndDb(ctx);if(auth.error)return auth.error;
 const data=await parseBody(ctx.request);
 const today=dateInSaoPaulo(),now=Date.now();
 if(data?.action==='start'){
  if(!validDailyDate(data.date)||data.date>today)return bodyError('Data inválida ou futura.',400);
  // A primeira entrada na missão precisa ocorrer no dia oficial. Depois disso,
  // a mesma missão pode ser retomada quantas vezes for necessário até vencer.
  const requestedDate=data.date;
  const version=dailyVersionForDate(requestedDate);
  const mission=dailyMission(game,requestedDate,version);
  if(!mission)return bodyError('Missão não encontrada.',400);
  const token=randomToken(),hash=await digest(token);
  try{
   // Sem migração 0010, não consumir uma tentativa v2 que não poderá ser avaliada.
   if(version>=2)await auth.db.prepare('SELECT lines_cleared,mission_success FROM daily_challenge_attempts LIMIT 0').all();
   // CREATE vale apenas no dia original. Para missão já recebida,
   // reutilizar a linha e emitir novo token (o anterior deixa de valer).
   const inserted=await auth.db.prepare(
    'INSERT INTO daily_challenge_attempts(game,challenge_date,player_id,seed_version,started_at_ms,attempt_token_hash) SELECT ?,?,?,?,?,? WHERE ?=? ON CONFLICT(game,challenge_date,player_id) DO NOTHING'
   ).bind(game,requestedDate,auth.player.id,version,now,hash,requestedDate,today).run();
   if(inserted.meta?.changes!==1){
    const row=await auth.db.prepare(
     'SELECT seed_version,outcome,mission_success FROM daily_challenge_attempts WHERE game=? AND challenge_date=? AND player_id=?'
    ).bind(game,requestedDate,auth.player.id).first();
    if(!row)return bodyError('A missão não foi recebida naquela data.',404);
    if(row.outcome==='finished'||row.mission_success===1||row.seed_version===1)
     return bodyError('Missão já concluída ou edição histórica sem metas.',409);
    const refreshed=await auth.db.prepare(
     "UPDATE daily_challenge_attempts SET attempt_token_hash=?,started_at_ms=? WHERE game=? AND challenge_date=? AND player_id=? AND outcome='started'"
    ).bind(hash,now,game,requestedDate,auth.player.id).run();
    if(refreshed.meta?.changes!==1)return bodyError('Missão já concluída.',409);
   }
   return reply({game,date:requestedDate,token,seed:dailySeed(game,requestedDate,version),mission,
    rules:mission.description,startedAt:now,expiresAt:null,retry:inserted.meta?.changes!==1},201);
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
   const existing=await auth.db.prepare(
    "SELECT seed_version FROM daily_challenge_attempts WHERE game=? AND challenge_date=? AND player_id=? AND attempt_token_hash=? AND outcome='started'"
   ).bind(game,data.date,auth.player.id,tokenHash).first();
   if(!existing)return bodyError('Tentativa já concluída, expirada ou pertencente a outra conta.',409);
   const version=existing.seed_version;
   const mission=dailyMission(game,data.date,version);
   if(!mission)return bodyError('Versão de desafio não reconhecida.',409);
   let won=null;
   let result;
   if(version>=2){
    if(!Number.isSafeInteger(data.linesCleared)||data.linesCleared<0||data.linesCleared>1000)return bodyError('Quantidade de linhas inválida.',400);
    if(game==='snake'&&data.linesCleared!==0)return bodyError('Linhas não se aplicam ao Snake.',400);
    let clearSequence=[];
    if(version>=3&&game==='tetris'){
     if(!Array.isArray(data.clearSequence)||data.clearSequence.length>1000
       ||data.clearSequence.some(n=>!Number.isSafeInteger(n)||n<1||n>4))
      return bodyError('Histórico de limpezas inválido.',400);
     clearSequence=data.clearSequence;
     if(clearSequence.reduce((sum,n)=>sum+n,0)!==data.linesCleared)
      return bodyError('Quantidade de linhas inconsistente com as limpezas.',400);
    }
    won=dailyMissionWon(mission,{score:data.score,durationMs:data.durationMs,
     linesCleared:data.linesCleared,clearSequence});
    if(!won){
     // Derrota é apenas uma tentativa de jogar: a missão permanece aberta,
     // inclusive nos dias posteriores. Não gravar um falso "concluído".
     return reply({saved:false,retryAvailable:true,date:data.date,score:data.score,
      durationMs:data.durationMs,linesCleared:data.linesCleared,missionSuccess:false,mission});
    }
    result=await auth.db.prepare(
     "UPDATE daily_challenge_attempts SET outcome='finished',score=?,duration_ms=?,finished_at_ms=?,lines_cleared=?,mission_success=? WHERE game=? AND challenge_date=? AND player_id=? AND attempt_token_hash=? AND outcome='started'"
    ).bind(data.score,data.durationMs,now,data.linesCleared,1,game,data.date,auth.player.id,tokenHash).run();
   }else{
    result=await auth.db.prepare(
     "UPDATE daily_challenge_attempts SET outcome='finished',score=?,duration_ms=?,finished_at_ms=? WHERE game=? AND challenge_date=? AND player_id=? AND attempt_token_hash=? AND outcome='started'"
    ).bind(data.score,data.durationMs,now,game,data.date,auth.player.id,tokenHash).run();
   }
   if(result.meta?.changes!==1)return bodyError('Tentativa já concluída, expirada ou pertencente a outra conta.',409);
   return reply({saved:true,date:data.date,score:data.score,durationMs:data.durationMs,linesCleared:data.linesCleared??null,missionSuccess:won,mission});
  }catch{return bodyError('Não foi possível confirmar o resultado. Reenvie a mesma tentativa sem iniciar outra.',503)}
 }
 return bodyError('Operação desconhecida.',400);
}
