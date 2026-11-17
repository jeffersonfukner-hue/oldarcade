/**
 * Contrato único dos desafios diários. Os títulos habilitados recebem a mesma
 * infraestrutura de calendário, conta, dia e estado, sem duplicar a interface.
 * O dia oficial usa America/Sao_Paulo, calculado no servidor.
 */
export const DAILY_TIME_ZONE='America/Sao_Paulo';
export const DAILY_MODES=Object.freeze({
 snake:Object.freeze({
  title:'Snake',gameMode:'snake',label:'Snake · Desafio Diário',
  path:'/jogos/snake/',rules:'Uma tentativa por dia. Todas as contas recebem a mesma sequência de frutas. Seu resultado fica disponível no perfil.',
  seedVersion:1
 })
});
export function dailyMode(game){return Object.hasOwn(DAILY_MODES,game)?DAILY_MODES[game]:null}
export function dateInSaoPaulo(now=new Date()){
 return new Intl.DateTimeFormat('en-CA',{timeZone:DAILY_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
}
export function validDailyDate(date){return typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&!Number.isNaN(Date.parse(date+'T12:00:00Z'))&&new Date(date+'T12:00:00Z').toISOString().slice(0,10)===date}
export function dailySeed(game,date,seedVersion=1){
 const input=game+'|'+date+'|'+seedVersion;let h=2166136261;
 for(let i=0;i<input.length;i++){h^=input.charCodeAt(i);h=Math.imul(h,16777619)}
 return h>>>0;
}
export function seededRandom(seed){
 let value=seed>>>0;
 return ()=>{value=(value+0x6d2b79f5)|0;let t=Math.imul(value^(value>>>15),1|value);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296}
}
