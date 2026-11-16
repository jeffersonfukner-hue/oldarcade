const reply=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const validId=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
async function totals(db){
 const rows=await db.prepare('SELECT game,kind,COUNT(*) AS total FROM game_events GROUP BY game,kind').all();
 let siteVisits=0,plays=0;
 const played=new Set();
 for(const row of rows.results||[]){
  const total=Number(row.total)||0;
  if(row.game==='site'&&row.kind==='visit')siteVisits+=total;
  else if(row.game!=='site'&&row.kind==='play'){plays+=total;if(total>0)played.add(row.game)}
 }
 return {available:true,siteVisits,gamesPlayed:played.size,totalPlays:plays};
}
export async function onRequestGet(ctx){
 const db=ctx.env?.OLDARCADE_STATS_DB;
 if(!db)return reply({available:false,error:'Contadores indisponíveis neste ambiente'},503);
 try{return reply(await totals(db))}catch{return reply({available:false,error:'Falha na consulta'},503)}
}
export async function onRequestPost(ctx){
 const url=new URL(ctx.request.url);
 if(ctx.request.headers.get('Origin')!==url.origin)return reply({error:'Origem não autorizada'},403);
 if(ctx.request.headers.get('Content-Type')?.split(';')[0].trim()!=='application/json')return reply({error:'Formato inválido'},415);
 const db=ctx.env?.OLDARCADE_STATS_DB;
 if(!db)return reply({available:false,error:'Contadores indisponíveis neste ambiente'},503);
 let body;
 try{
  const raw=await ctx.request.text();
  if(raw.length>256)return reply({error:'Dados excessivos'},413);
  body=JSON.parse(raw);
 }catch{return reply({error:'JSON inválido'},400)}
 if(typeof body?.eventId!=='string'||!validId.test(body.eventId))return reply({error:'ID inválido'},400);
 try{
  await db.prepare('INSERT INTO game_events(event_id,game,kind) VALUES (?,?,?) ON CONFLICT(event_id) DO NOTHING').bind(body.eventId,'site','visit').run();
  return reply(await totals(db));
 }catch{return reply({available:false,error:'Falha no registro'},503)}
}
