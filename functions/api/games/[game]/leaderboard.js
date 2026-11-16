const respond=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
async function standings(db){
 const res=await db.prepare('SELECT nickname,best_score FROM game_leaderboard WHERE game=? ORDER BY best_score DESC,updated_at ASC LIMIT 10').bind('snake').all();
 return {available:true,top:(res.results||[]).map(r=>({nickname:r.nickname,score:r.best_score})),verified:false};
}
export async function onRequestGet(ctx){
 if(ctx.params?.game!=='snake')return respond({error:'Jogo não encontrado'},404);
 if(!ctx.env?.OLDARCADE_STATS_DB)return respond({available:false,error:'Ranking indisponível'},503);
 try{return respond(await standings(ctx.env.OLDARCADE_STATS_DB))}
 catch{return respond({available:false,error:'Ranking indisponível'},503)}
}
export async function onRequestPost(ctx){
 if(ctx.params?.game!=='snake')return respond({error:'Jogo não encontrado'},404);
 if(ctx.request.headers.get('Origin')!==new URL(ctx.request.url).origin)return respond({error:'Origem inválida'},403);
 if(ctx.request.headers.get('Content-Type')?.split(';')[0].trim()!=='application/json')return respond({error:'Formato inválido'},415);
 const db=ctx.env?.OLDARCADE_STATS_DB;
 if(!db)return respond({available:false,error:'Ranking indisponível'},503);
 let data;
 try{const raw=await ctx.request.text();if(raw.length>512)return respond({error:'Dados excessivos'},413);data=JSON.parse(raw)}
 catch{return respond({error:'Dados inválidos'},400)}
 const nickname=typeof data?.nickname==='string'?data.nickname.trim():'';
 if(!uuid.test(data?.playerId||'')||nickname.length<1||nickname.length>18||/[<>\u0000-\u001f\u007f]/.test(nickname)||
 !Number.isSafeInteger(data.score)||data.score<0||data.score>4000||data.score%10!==0)
 return respond({error:'Nickname ou pontuação inválidos'},400);
 try{
  await db.prepare("INSERT INTO game_leaderboard(game,player_id,nickname,best_score) VALUES (?,?,?,?) ON CONFLICT(game,player_id) DO UPDATE SET nickname=excluded.nickname,best_score=MAX(best_score,excluded.best_score),updated_at=CURRENT_TIMESTAMP")
   .bind('snake',data.playerId,nickname,data.score).run();
  return respond(await standings(db));
 }catch{return respond({available:false,error:'Falha ao registrar recorde'},503)}
}
