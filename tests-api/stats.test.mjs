import {test} from 'node:test';
import assert from 'node:assert/strict';
import {onRequestGet,onRequestPost} from '../functions/api/games/[game]/stats.js';
const origin='https://preview.example';
const uuid='0a1b2c3d-4444-4444-8444-123456789abc';
function mock(){
 const events=new Map();
 return {prepare(sql){let vars=[];return {
  bind(...v){vars=v;return this},
  async run(){if(!events.has(vars[0]))events.set(vars[0],{game:vars[1],kind:vars[2]});},
  async all(){const count={};for(const e of events.values())if(e.game===vars[0])count[e.kind]=(count[e.kind]||0)+1;return {results:Object.entries(count).map(([kind,total])=>({kind,total}))}}
 }}};
}
function ctx(db,kind,id=uuid,requestOrigin=origin){return {params:{game:'snake'},env:db?{OLDARCADE_STATS_DB:db}:{},
 request:new Request(origin+'/api/games/snake/stats',{method:'POST',headers:{Origin:requestOrigin,'Content-Type':'application/json'},body:JSON.stringify({kind,eventId:id})})}}
test('sem D1 não publica valores fictícios',async()=>{const r=await onRequestGet({params:{game:'snake'},env:{}});assert.equal(r.status,503);assert.equal((await r.json()).available,false)});
test('idempotência: visita repetida uma vez, partidas independentes',async()=>{
 const db=mock();let r=await onRequestPost(ctx(db,'visit'));assert.equal((await r.json()).visits,1);
 r=await onRequestPost(ctx(db,'visit'));assert.equal((await r.json()).visits,1);
 r=await onRequestPost(ctx(db,'play','aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'));assert.equal((await r.json()).plays,1);
 r=await onRequestPost(ctx(db,'play','bbbbbbbb-bbbb-4ccc-8ddd-eeeeeeeeeeee'));assert.equal((await r.json()).plays,2);
 r=await onRequestGet({params:{game:'snake'},env:{OLDARCADE_STATS_DB:db}});assert.deepEqual(await r.json(),{available:true,visits:1,plays:2});
});
test('rejeita origem estranha e identificador inválido',async()=>{
 const db=mock();assert.equal((await onRequestPost(ctx(db,'visit',uuid,'https://other.example'))).status,403);
 assert.equal((await onRequestPost(ctx(db,'visit','abc'))).status,400);
});
