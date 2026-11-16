import {test} from 'node:test';import assert from 'node:assert/strict';
import {onRequestPost,onRequestGet} from '../functions/api/site/stats.js';
const origin='https://preview.example';
const uuid='0a1b2c3d-4444-4444-8444-123456789abc';
function mock(){
 const events=new Map();
 return {prepare(sql){let values=[];return {
 bind(...args){values=args;return this},
 async run(){events.set(values[0],events.get(values[0])||{game:values[1],kind:values[2]})},
 async all(){const counts=new Map();for(const e of events.values()){const k=e.game+'|'+e.kind;counts.set(k,(counts.get(k)||0)+1)}return {results:[...counts].map(([key,total])=>({game:key.split('|')[0],kind:key.split('|')[1],total}))}}
 }},add(id,game,kind){events.set(id,{game,kind})}};
}
function post(db,id=uuid){return {env:{OLDARCADE_STATS_DB:db},request:new Request(origin+'/api/site/stats',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({eventId:id})})}}
test('visitas do portal são idempotentes, partidas por título são agregadas',async()=>{
 const db=mock();db.add('a','snake','play');db.add('b','snake','play');db.add('c','pong','play');db.add('d','snake','visit');
 let r=await onRequestPost(post(db));assert.equal(r.status,200);assert.deepEqual(await r.json(),{available:true,siteVisits:1,gamesPlayed:2,totalPlays:3});
 r=await onRequestPost(post(db));assert.equal((await r.json()).siteVisits,1);
 r=await onRequestGet({env:{OLDARCADE_STATS_DB:db}});assert.equal((await r.json()).totalPlays,3);
});
test('sem D1 falha de forma honesta',async()=>{
 const r=await onRequestGet({env:{}});assert.equal(r.status,503);assert.equal((await r.json()).available,false);
});
test('site rejeita origens externas e IDs inválidos',async()=>{
 const db=mock();const wrong=post(db);wrong.request=new Request(origin+'/api/site/stats',{method:'POST',headers:{Origin:'https://other.example','Content-Type':'application/json'},body:JSON.stringify({eventId:uuid})});
 assert.equal((await onRequestPost(wrong)).status,403);
 assert.equal((await onRequestPost(post(db,'invalid'))).status,400);
});

test('total de partidas agrega todos os títulos e modos, sem duplicar eventos',async()=>{
 const db=mock();
 db.add('classic-1','snake','play');db.add('classic-2','snake','play');
 db.add('adventure-1','snake-adventure','play');db.add('pong-1','pong','play');
 db.add('not-play','snake-adventure','visit');db.add('site-visit','site','visit');
 const response=await onRequestGet({env:{OLDARCADE_STATS_DB:db}});
 assert.deepEqual(await response.json(),{available:true,siteVisits:1,gamesPlayed:3,totalPlays:4});
});
