import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DAILY_MODES,dateInSaoPaulo,dailySeed,seededRandom,validDailyDate} from '../src/data/dailyChallenges.js';
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
    return null;
   },
   async all(){
    if(sql.includes('daily_challenge_attempts'))return {results:[...attempts.values()].map(x=>({challenge_date:x.date,outcome:x.status}))};
    return {results:[]};
   },
   async run(){
    if(sql.includes('INSERT INTO daily_challenge_attempts')){
     const [game,date,player,version,started,tokenHash]=this.args;
     const key=game+':'+date+':'+player;
     if(attempts.has(key))return {meta:{changes:0}};
     attempts.set(key,{game,date,player,version,started,tokenHash,status:'started'});
     return {meta:{changes:1}};
    }
    if(sql.includes('UPDATE daily_challenge_attempts')){
     const [score,durationMs,finished,game,date,player,hash]=this.args;
     const item=attempts.get(game+':'+date+':'+player);
     if(!item||item.status!=='started'||item.tokenHash!==hash)return {meta:{changes:0}};
     Object.assign(item,{score,durationMs,finished,status:'finished'});
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
test('usuário logado reserva exatamente uma tentativa e só uma conclusão',async()=>{
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
 assert.deepEqual((await today.json()).days,[{date:day,status:'finished'}]);
});
test('datas passadas e futuras não podem iniciar desafio; origem inválida é proibida',async()=>{
 const {db}=mockDb();
 for(const date of ['2000-01-01','2099-12-31']){
  const res=await onRequestPost({params:{game:'snake'},env:{OLDARCADE_STATS_DB:db},request:request('POST',{action:'start',date},true)});
  assert.equal(res.status,400);
 }
 const res=await onRequestPost({params:{game:'snake'},env:{OLDARCADE_STATS_DB:db},request:new Request(origin+'/api/daily/snake',{method:'POST',headers:{'Origin':'https://evil.invalid','Content-Type':'application/json','Cookie':'oldarcade_session='+session},body:JSON.stringify({action:'start',date:dateInSaoPaulo()})})});
 assert.equal(res.status,403);
});
