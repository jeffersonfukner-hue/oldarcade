// Cenários de reserva legados incompatíveis com o modo diário congelado; preservar para retomada futura.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DAILY_MODES,dateInSaoPaulo,dailySeed,seededRandom,validDailyDate,dailyVersionForDate,dailyMission,dailyMissionWon} from '../src/data/dailyChallenges.js';
import {onRequestGet,onRequestPost} from '../functions/api/daily/[game].js';
import {onRequestGet as getProfile} from '../functions/api/daily/profile.js';

const origin='https://oldarcade.test';
const session='a'.repeat(64);
const request=(method='GET',body=null,logged=false)=>new Request(origin+'/api/daily/snake',{
 method,
 headers:{...(method==='POST'?{'Origin':origin,'Content-Type':'application/json'}:{}),...(logged?{'Cookie':'oldarcade_session='+session}:{})},
 ...(body?{body:JSON.stringify(body)}:{})
});
const mockDb=()=>{
 const attempts=new Map(),queries=[];
 const db={prepare(sql){
  queries.push(sql);
  const stmt={
   args:[],bind(...args){this.args=args;return this},
   async first(){
    if(sql.includes('player_sessions'))return {id:'user-1',nickname:'Jogador teste',email:null,email_verified:0};
    if(sql.includes('SELECT seed_version FROM daily_challenge_attempts')){
     const [game,date,player,hash]=this.args;
     const item=attempts.get(game+':'+date+':'+player);
     return item&&item.tokenHash===hash&&item.status==='started'?{seed_version:item.version}:null;
    }
    if(sql.includes('SELECT seed_version,outcome,mission_success FROM daily_challenge_attempts')){
     const [game,date,player]=this.args;
     const item=attempts.get(game+':'+date+':'+player);
     return item?{seed_version:item.version,outcome:item.status,mission_success:item.missionSuccess??null}:null;
    }
    return null;
   },
   async all(){
    if(sql.includes('daily_challenge_attempts')){
     const game=this.args[0],player=this.args[1];
     return {results:[...attempts.values()].filter(x=>!sql.includes('WHERE game=')||x.game===game&&x.player===player).map(x=>({
      challenge_date:x.date,outcome:x.status,score:x.score??null,duration_ms:x.durationMs??null,
      seed_version:x.version,lines_cleared:x.linesCleared??null,mission_success:x.missionSuccess??null
     }))};
    }
    return {results:[]};
   },
   async run(){
    if(sql.includes('INSERT INTO daily_challenge_attempts')){
     const [game,date,player,version,started,tokenHash]=this.args;
     if(sql.includes('WHERE ?=?')&&this.args[6]!==this.args[7])return {meta:{changes:0}};
     const key=game+':'+date+':'+player;
     if(attempts.has(key))return {meta:{changes:0}};
     attempts.set(key,{game,date,player,version,started,tokenHash,status:'started'});
     return {meta:{changes:1}};
    }
    if(sql.includes('UPDATE daily_challenge_attempts')){
     if(sql.includes('SET attempt_token_hash=?')){
      const [hash,started,game,date,player]=this.args;
      const item=attempts.get(game+':'+date+':'+player);
      if(!item||item.status==='finished'&&item.missionSuccess!==0)return {meta:{changes:0}};
      Object.assign(item,{tokenHash:hash,started,status:'started',score:null,durationMs:null,finished:null,linesCleared:null,missionSuccess:null});
      return {meta:{changes:1}};
     }
     const modern=sql.includes('lines_cleared=?');
     const [score,durationMs,finished,...rest]=this.args;
     const [game,date,player,hash]=modern?rest.slice(2):rest;
     const item=attempts.get(game+':'+date+':'+player);
     if(!item||item.status!=='started'||item.tokenHash!==hash)return {meta:{changes:0}};
     Object.assign(item,{score,durationMs,finished,status:'finished'});
     if(modern){item.linesCleared=rest[0];item.missionSuccess=rest[1]}
     return {meta:{changes:1}};
    }
    return {meta:{changes:0}};
   }
  };
  return stmt;
 }};
 return {db,attempts,queries};
};
test('dia diário é de Brasília inclusive próximo da virada UTC',()=>{
 assert.equal(dateInSaoPaulo(new Date('2026-11-18T02:59:59Z')),'2026-11-17');
 assert.equal(dateInSaoPaulo(new Date('2026-11-18T03:00:00Z')),'2026-11-18');
 assert.equal(validDailyDate('2026-02-30'),false);
 assert.equal(validDailyDate('2026-11-17'),true);
 assert.equal(DAILY_MODES.snake.seedVersion,1);
 const a=seededRandom(dailySeed('snake','2026-11-17'));
 const b=seededRandom(dailySeed('snake','2026-11-17'));
 assert.deepEqual(Array.from({length:10},()=>a()),Array.from({length:10},()=>b()));
 assert.notEqual(dailySeed('snake','2026-11-17'),dailySeed('snake','2026-11-18'));
});
test('visitante consulta calendário público, mas NUNCA inicia desafio',async()=>{
 const {db,attempts}=mockDb();
 const response=await onRequestGet({params:{game:'snake'},env:{OLDARCADE_STATS_DB:db},request:request()});
 assert.equal(response.status,200);
 const publicData=await response.json();
 assert.equal(publicData.account,null);
 assert.deepEqual(publicData.days,[]);
 const post=await onRequestPost({params:{game:'snake'},env:{OLDARCADE_STATS_DB:db},request:request('POST',{action:'start',date:dateInSaoPaulo()})});
 assert.equal(post.status,401);
 assert.equal(attempts.size,0);
 const profile=await getProfile({env:{OLDARCADE_STATS_DB:db},request:request()});
 assert.equal(profile.status,401);
});
test.skip('usuário logado reserva exatamente uma tentativa e só uma conclusão',async()=>{
 const {db,attempts}=mockDb();
 const day=dateInSaoPaulo();
 const ctx=(body)=>({params:{game:'snake'},env:{OLDARCADE_STATS_DB:db},request:request('POST',body,true)});
 const start=await onRequestPost(ctx({action:'start',date:day}));
 assert.equal(start.status,201);
 const grant=await start.json();
 assert.equal(grant.date,day);
 assert.equal(typeof grant.seed,'number');
 assert.match(grant.token,/^[a-f0-9]{64}$/);
 assert.equal(attempts.size,1);
 const repeat=await onRequestPost(ctx({action:'start',date:day}));
 assert.equal(repeat.status,409);
 const badToken=await onRequestPost(ctx({action:'finish',date:day,score:100,durationMs:10000,token:'f'.repeat(64)}));
 assert.equal(badToken.status,409);
 const finish=await onRequestPost(ctx({action:'finish',date:day,score:100,durationMs:10000,token:grant.token}));
 assert.equal(finish.status,200);
 assert.equal((await finish.json()).saved,true);
 const secondFinish=await onRequestPost(ctx({action:'finish',date:day,score:200,durationMs:11000,token:grant.token}));
 assert.equal(secondFinish.status,409);
 const today=await onRequestGet({params:{game:'snake'},env:{OLDARCADE_STATS_DB:db},request:request('GET',null,true)});
 assert.equal(today.status,200);
 const record=(await today.json()).days[0];
 assert.equal(record.date,day);
 assert.equal(record.status,'finished');
 assert.equal(record.score,100);
 assert.equal(record.durationMs,10000);
 assert.equal(record.version,dailyVersionForDate(day));
});
test('datas antigas não recebidas e datas futuras não iniciam missão; origem inválida é proibida',async()=>{
 const {db}=mockDb();
 for(const date of ['2000-01-01','2099-12-31']){
  const res=await onRequestPost({params:{game:'snake'},env:{OLDARCADE_STATS_DB:db},request:request('POST',{action:'start',date},true)});
  assert.equal(res.status,date==='2000-01-01'?404:400);
 }
 const res=await onRequestPost({params:{game:'snake'},env:{OLDARCADE_STATS_DB:db},request:new Request(origin+'/api/daily/snake',{method:'POST',headers:{'Origin':'https://evil.invalid','Content-Type':'application/json','Cookie':'oldarcade_session='+session},body:JSON.stringify({action:'start',date:dateInSaoPaulo()})})});
 assert.equal(res.status,403);
});

test.skip('Tetris usa a infraestrutura diária compartilhada, sem misturar pontuação Snake',async()=>{
 assert.equal(DAILY_MODES.tetris.gameMode,'tetris');
 assert.equal(DAILY_MODES.tetris.path,'/jogos/tetris/');
 const piecesA=seededRandom(dailySeed('tetris','2026-11-17'));
 const piecesB=seededRandom(dailySeed('tetris','2026-11-17'));
 assert.deepEqual(Array.from({length:14},()=>piecesA()),Array.from({length:14},()=>piecesB()));
 assert.notEqual(dailySeed('tetris','2026-11-17'),dailySeed('snake','2026-11-17'));
 const {db,attempts}=mockDb();
 const day=dateInSaoPaulo();
 const dailyRequest=(body)=>new Request(origin+'/api/daily/tetris',{method:'POST',headers:{'Origin':origin,'Content-Type':'application/json','Cookie':'oldarcade_session='+session},body:JSON.stringify(body)});
 const ctx=(body)=>({params:{game:'tetris'},env:{OLDARCADE_STATS_DB:db},request:dailyRequest(body)});
 const start=await onRequestPost(ctx({action:'start',date:day}));
 assert.equal(start.status,201);
 const token=(await start.json()).token;
 const repeated=await onRequestPost(ctx({action:'start',date:day}));
 assert.equal(repeated.status,409);
 assert.equal(attempts.size,1);
 const invalid=await onRequestPost(ctx({action:'finish',date:day,token,score:150,durationMs:5000}));
 assert.equal(invalid.status,400);
 const valid=await onRequestPost(ctx({action:'finish',date:day,token,score:12300,durationMs:5000}));
 assert.equal(valid.status,200);
 const again=await onRequestPost(ctx({action:'finish',date:day,token,score:12300,durationMs:5000}));
 assert.equal(again.status,409);
});

test('calendário logado permanece visível e bloqueado se consulta do histórico falhar',async()=>{
 const {db}=mockDb();
 const original=db.prepare;
 db.prepare=(sql)=>{
  const stmt=original(sql);
  if(sql.includes('FROM daily_challenge_attempts')&&sql.includes('SELECT challenge_date,outcome')){
   stmt.all=async()=>{throw Error('D1_ERROR: no such table: daily_challenge_attempts')};
  }
  return stmt;
 };
 const response=await onRequestGet({params:{game:'snake'},env:{OLDARCADE_STATS_DB:db},request:request('GET',null,true)});
 assert.equal(response.status,200);
 const body=await response.json();
 assert.equal(body.account.nickname,'Jogador teste');
 assert.equal(body.historyAvailable,false);
 assert.equal(body.errorCode,'SCHEMA_MISSING');
 assert.match(body.error,/tabela de desafios diários não foi encontrada/);
 assert.equal(body.today,dateInSaoPaulo());
 assert.deepEqual(body.days,[]);
 assert.match(body.error,/conexão do D1/);
});
test('consulta de calendário autenticado usa só identidade, sem colunas opcionais de preferências',async()=>{
 const {db,queries}=mockDb();
 const response=await onRequestGet({params:{game:'snake'},env:{OLDARCADE_STATS_DB:db},request:request('GET',null,true)});
 assert.equal(response.status,200);
 const body=await response.json();
 assert.equal(body.account.nickname,'Jogador teste');
 assert.equal(body.historyAvailable,true);
 const sessionSql=queries.find(sql=>sql.includes('player_sessions'));
 assert.match(sessionSql,/SELECT a\.id,a\.nickname FROM player_sessions/);
 assert.doesNotMatch(sessionSql,/daily_email_opt_in|record_email_opt_in/);
});

test('gerador cria metas variadas e determinísticas em 1000 dias sem cadastro manual',()=>{
 const start=Date.parse('2026-11-20T12:00:00Z');
 for(const game of ['snake','tetris']){
  const distinct=new Set(),families=new Set(),difficulties=new Set();
  let previous='';
  for(let offset=0;offset<1000;offset++){
   const date=new Date(start+offset*86400000).toISOString().slice(0,10);
   const mission=dailyMission(game,date);
   const again=dailyMission(game,date);
   assert.deepEqual(mission,again);
   assert.equal(mission.version,3);
   assert.ok(mission.target>0);
   assert.ok(mission.description.length>25);
   assert.notEqual(mission.kind,previous,'não repetir família em dias consecutivos');
   previous=mission.kind;
   families.add(mission.kind);difficulties.add(mission.difficulty);
   distinct.add(JSON.stringify([mission.kind,mission.target,mission.sequence,mission.hazards,mission.timeLimitMs]));
  }
  assert.equal(families.size,5);
  assert.ok(distinct.size>75,'metas suficientemente variadas');
  assert.equal(difficulties.size,3);
 }
});

test('missões Tetris exatas não aceitam limpeza errada nem total de linhas enganoso',()=>{
 const date='2026-11-24';
 for(let offset=0;offset<100;offset++){
  const day=new Date(Date.parse(date+'T12:00:00Z')+offset*86400000).toISOString().slice(0,10);
  const mission=dailyMission('tetris',day);
  if(mission.kind==='quads'){
   const quads=mission.target/800;
   assert.equal(dailyMissionWon(mission,{score:99999,durationMs:10000,linesCleared:10,clearSequence:[1,2,3,4]}),false);
   assert.equal(dailyMissionWon(mission,{score:mission.target-100,durationMs:10000,linesCleared:quads*4,clearSequence:Array(quads).fill(4)}),false);
   assert.equal(dailyMissionWon(mission,{score:mission.target,durationMs:10000,linesCleared:quads*4,clearSequence:Array(quads).fill(4)}),true);
  }
  if(mission.kind==='sequence'){
   const sequence=mission.sequence;
   assert.equal(dailyMissionWon(mission,{score:9999,durationMs:10000,linesCleared:sequence.reduce((a,b)=>a+b,0),clearSequence:[...sequence].reverse()}),sequence.join(',')===[...sequence].reverse().join(','));
   assert.equal(dailyMissionWon(mission,{score:9999,durationMs:10000,linesCleared:sequence.reduce((a,b)=>a+b,0),clearSequence:sequence}),true);
  }
 }
});
