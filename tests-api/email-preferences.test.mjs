import {test} from 'node:test';
import assert from 'node:assert/strict';
import {onRequestGet,onRequestPost} from '../functions/api/account/preferences.js';
const origin='https://oldarcade.test';
const session='c'.repeat(64);
function fixture(){
 let updated=null;
 const player={id:'user-id',nickname:'Jogador',email:'old@example.com',email_verified:1,record_email_opt_in:1,daily_email_opt_in:0};
 const db={prepare(sql){return {
  bind(...args){this.args=args;return this},
  async first(){if(sql.includes('player_sessions'))return player;return null},
  async run(){updated={sql,args:this.args};return {meta:{changes:1}}}
 }}};
 const request=(method='GET',body=null,logged=true)=>new Request(origin+'/api/account/preferences',{method,headers:{
  ...(logged?{Cookie:'oldarcade_session='+session}:{}),
  ...(method==='POST'?{Origin:origin,'Content-Type':'application/json'}:{})
 },...(body?{body:JSON.stringify(body)}:{})});
 return {db,player,request,get updated(){return updated}};
}
test('preferencias exigem sessao e nao ativam servico de envio',async()=>{
 const x=fixture();
 assert.equal((await onRequestGet({request:x.request('GET',null,false),env:{OLDARCADE_STATS_DB:x.db}})).status,401);
 const r=await onRequestGet({request:x.request(),env:{OLDARCADE_STATS_DB:x.db}});
 assert.equal(r.status,200);
 assert.deepEqual(await r.json(),{email:'old@example.com',emailVerified:true,recordEmailOptIn:true,dailyEmailOptIn:false,deliveryAvailable:false});
});
test('perfil salva email e consentimentos independentes e invalida verificacao de endereco alterado',async()=>{
 const x=fixture();
 const ctx={request:x.request('POST',{email:'new@example.com',recordEmailOptIn:false,dailyEmailOptIn:true}),env:{OLDARCADE_STATS_DB:x.db}};
 const r=await onRequestPost(ctx);
 assert.equal(r.status,200);
 const body=await r.json();assert.equal(body.emailVerified,false);assert.equal(body.dailyEmailOptIn,true);
 assert.deepEqual(x.updated.args,['new@example.com','old@example.com',0,1,'user-id']);
 assert.match(x.updated.sql,/email_verified=CASE/);
});
test('avisos exigem email e booleanos reais',async()=>{
 const x=fixture();
 for(const data of [{email:'',recordEmailOptIn:false,dailyEmailOptIn:true},{email:'oops',recordEmailOptIn:false,dailyEmailOptIn:false},{email:'valid@example.com',recordEmailOptIn:'true',dailyEmailOptIn:false}]){
  const r=await onRequestPost({request:x.request('POST',data),env:{OLDARCADE_STATS_DB:x.db}});
  assert.equal(r.status,400);
 }
 assert.equal(x.updated,null);
});
