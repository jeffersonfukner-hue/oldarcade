const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const validId=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function getDB(context){return context.env?.OLDARCADE_STATS_DB;}
function game(context){return String(context.params?.game||'');}
async function counts(db,g){
 const results=await db.prepare('SELECT kind, COUNT(*) AS total FROM game_events WHERE game=? GROUP BY kind').bind(g).all();
 let visits=0,plays=0;
 for(const entry of results.results||[]){if(entry.kind==='visit')visits=Number(entry.total);if(entry.kind==='play')plays=Number(entry.total);}
 return {available:true,visits,plays};
}
export async function onRequestGet(context){
 if(!['snake','snake-adventure'].includes(game(context)))return reply({error:'Jogo desconhecido'},404);
 const db=getDB(context);if(!db)return reply({available:false,error:'Banco ainda não vinculado'},503);
 try{return reply(await counts(db,game(context)))}catch{return reply({available:false,error:'Serviço indisponível'},503)}
}
export async function onRequestPost(context){
 if(!['snake','snake-adventure'].includes(game(context)))return reply({error:'Jogo desconhecido'},404);
 const url=new URL(context.request.url);
 if(context.request.headers.get('Origin')!==url.origin)return reply({error:'Origem não autorizada'},403);
 if(context.request.headers.get('Content-Type')?.split(';')[0].trim()!=='application/json')return reply({error:'Formato inválido'},415);
 const db=getDB(context);if(!db)return reply({available:false,error:'Banco ainda não vinculado'},503);
 let body;
 try{const raw=await context.request.text();if(raw.length>512)return reply({error:'Excesso de dados'},413);body=JSON.parse(raw);}
 catch{return reply({error:'JSON inválido'},400)}
 if(!body||!['visit','play'].includes(body.kind)||typeof body.eventId!=='string'||!validId.test(body.eventId))return reply({error:'Evento inválido'},400);
 try{
  await db.prepare('INSERT INTO game_events(event_id,game,kind) VALUES (?,?,?) ON CONFLICT(event_id) DO NOTHING').bind(body.eventId,game(context),body.kind).run();
  return reply(await counts(db,game(context)));
 }catch{return reply({available:false,error:'Falha no registro'},503)}
}
