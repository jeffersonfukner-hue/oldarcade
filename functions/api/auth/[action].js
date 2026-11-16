import {normalizeNickname,normalizeEmail,validPassword,randomToken,digest,passwordHash,equalFixed,reply,cookieHeader,clearCookie,sessionCookie,currentPlayer,sameOrigin,parseBody,playerResponse} from '../_lib/auth.js';
const DAY=86400;
export async function onRequestGet(ctx){
 if(ctx.params?.action!=='me')return reply({error:'Endpoint inválido'},404);
 const db=ctx.env?.OLDARCADE_STATS_DB;if(!db)return reply({available:false},503);
 try{const player=await currentPlayer(db,ctx.request);return reply({available:true,player:player?playerResponse(player):null})}
 catch{return reply({error:'Serviço indisponível'},503)}
}
export async function onRequestPost(ctx){
 const action=ctx.params?.action;
 if(!['register','login','logout'].includes(action))return reply({error:'Endpoint inválido'},404);
 if(!sameOrigin(ctx.request))return reply({error:'Origem não autorizada'},403);
 const db=ctx.env?.OLDARCADE_STATS_DB;if(!db)return reply({available:false},503);
 if(action==='logout'){
  try{const token=sessionCookie(ctx.request);if(token)await db.prepare('DELETE FROM player_sessions WHERE token_hash=?').bind(await digest(token)).run();
   return reply({ok:true},200,{'Set-Cookie':clearCookie()});
  }catch{return reply({error:'Serviço indisponível'},503)}
 }
 const body=await parseBody(ctx.request);if(!body||typeof body!=='object')return reply({error:'Dados inválidos'},400);
 const nick=normalizeNickname(body.nickname);
 if(!nick)return reply({error:'Nickname inválido (3–18 caracteres: letras, números, _, - ou ponto)'},400);
 if(!validPassword(body.password))return reply({error:'Senha deve conter de 12 a 128 caracteres'},400);
 if(action==='register'){
  const email=normalizeEmail(body.email);
  if(email===false)return reply({error:'E-mail inválido'},400);
  try{
   const exists=await db.prepare('SELECT id FROM player_accounts WHERE nickname_key=?').bind(nick.key).first();
   if(exists)return reply({error:'Nickname já utilizado'},409);
   const alerts=body.recordEmailOptIn===true?1:0;
   if(body.recordEmailOptIn!==undefined&&typeof body.recordEmailOptIn!=='boolean')return reply({error:'Preferência inválida'},400);
   const id=crypto.randomUUID(),salt=randomToken(16),hash=await passwordHash(body.password,salt);
   const recovery=randomToken(20);
   await db.prepare('INSERT INTO player_accounts(id,nickname,nickname_key,email,password_hash,password_salt,recovery_hash,record_email_opt_in) VALUES (?,?,?,?,?,?,?,?)')
    .bind(id,nick.nickname,nick.key,email,hash,salt,await digest(recovery),alerts).run();
   const session=randomToken(),sessionHash=await digest(session);
   await db.prepare('INSERT INTO player_sessions(token_hash,player_id,expires_at) VALUES (?,?,?)')
    .bind(sessionHash,id,Math.floor(Date.now()/1000)+30*DAY).run();
   return reply({ok:true,player:{id,nickname:nick.nickname,email,emailVerified:false,recordEmailOptIn:Boolean(alerts)},recoveryCode:recovery},201,{'Set-Cookie':cookieHeader(session)});
  }catch(e){
   if(String(e).includes('UNIQUE')||String(e).includes('unique'))return reply({error:'Nickname já utilizado'},409);
   return reply({error:'Não foi possível criar a conta'},503);
  }
 }
 try{
  const attempts=await db.prepare('SELECT attempts,window_until FROM player_login_attempts WHERE nickname_key=?').bind(nick.key).first();
  const now=Math.floor(Date.now()/1000);
  if(attempts?.attempts>=5&&attempts.window_until>now)return reply({error:'Muitas tentativas. Tente mais tarde.'},429);
  const player=await db.prepare('SELECT id,nickname,email,email_verified,password_hash,password_salt FROM player_accounts WHERE nickname_key=?').bind(nick.key).first();
  const candidate=await passwordHash(body.password,player?.password_salt||'00000000000000000000000000000000');
  if(!player||!equalFixed(candidate,player.password_hash)){
   await db.prepare('INSERT INTO player_login_attempts(nickname_key,attempts,window_until) VALUES (?,1,?) ON CONFLICT(nickname_key) DO UPDATE SET attempts=CASE WHEN window_until<? THEN 1 ELSE attempts+1 END,window_until=CASE WHEN window_until<? THEN excluded.window_until ELSE window_until END')
    .bind(nick.key,now+900,now,now).run();
   return reply({error:'Nickname ou senha inválidos'},401);
  }
  await db.prepare('DELETE FROM player_login_attempts WHERE nickname_key=?').bind(nick.key).run();
  const session=randomToken();
  await db.prepare('INSERT INTO player_sessions(token_hash,player_id,expires_at) VALUES (?,?,?)')
   .bind(await digest(session),player.id,now+30*DAY).run();
  return reply({ok:true,player:playerResponse(player)},200,{'Set-Cookie':cookieHeader(session)});
 }catch{return reply({error:'Não foi possível entrar'},503)}
}
