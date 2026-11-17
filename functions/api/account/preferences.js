import {currentPlayer,normalizeEmail,reply,sameOrigin,parseBody} from '../_lib/auth.js';

// Notificações são apenas preferências salvas. Nenhum e-mail é enviado nesta etapa.
export async function onRequestGet(ctx){
 const db=ctx.env?.OLDARCADE_STATS_DB;
 if(!db)return reply({error:'Serviço indisponível'},503);
 try{
  const player=await currentPlayer(db,ctx.request);
  if(!player)return reply({error:'Entre em sua conta.'},401);
  return reply({email:player.email||null,emailVerified:Boolean(player.email_verified),
   recordEmailOptIn:Boolean(player.record_email_opt_in),dailyEmailOptIn:Boolean(player.daily_email_opt_in),
   deliveryAvailable:false});
 }catch{return reply({error:'Preferências indisponíveis'},503)}
}
export async function onRequestPost(ctx){
 if(!sameOrigin(ctx.request))return reply({error:'Origem inválida'},403);
 const db=ctx.env?.OLDARCADE_STATS_DB;
 if(!db)return reply({error:'Serviço indisponível'},503);
 const data=await parseBody(ctx.request);
 if(!data||typeof data.recordEmailOptIn!=='boolean'||typeof data.dailyEmailOptIn!=='boolean')
  return reply({error:'Escolha suas preferências de notificação.'},400);
 const email=normalizeEmail(data.email);
 if(email===false)return reply({error:'E-mail inválido'},400);
 if(!email&&(data.recordEmailOptIn||data.dailyEmailOptIn))return reply({error:'Adicione um e-mail para escolher avisos.'},400);
 try{
  const player=await currentPlayer(db,ctx.request);
  if(!player)return reply({error:'Entre em sua conta.'},401);
  await db.prepare('UPDATE player_accounts SET email=?,email_verified=CASE WHEN email IS ? THEN email_verified ELSE 0 END,record_email_opt_in=?,daily_email_opt_in=? WHERE id=?')
   .bind(email,player.email||null,data.recordEmailOptIn?1:0,data.dailyEmailOptIn?1:0,player.id).run();
  return reply({ok:true,email,emailVerified:email===player.email?Boolean(player.email_verified):false,
    recordEmailOptIn:data.recordEmailOptIn,dailyEmailOptIn:data.dailyEmailOptIn,deliveryAvailable:false});
 }catch{return reply({error:'Não foi possível salvar as preferências.'},503)}
}
