/** Recordes da fase no HUD, sem confundir com a classificação total do site. */
export type QuestBoard={available:boolean;top?:Array<{score:number}>;mine?:{score:number}|null;saved?:boolean;error?:string};
export type StageResult={levelId:string;score:number;durationMs:number};
export function setupQuestStageRecords(onUpdate:(levelId:string,board:QuestBoard)=>void){
 let authenticated=false;
 const pending=new Map<string,StageResult>();
 const url=(levelId:string)=>'/api/quest/rankings/'+encodeURIComponent(levelId);
 async function refresh(levelId:string){
  try{const res=await fetch(url(levelId),{cache:'no-store'});
   if(res.ok)onUpdate(levelId,await res.json() as QuestBoard);
  }catch{/* não anunciar valor inexistente com falha de rede */}
 }
 async function send(result:StageResult){
  if(!authenticated)return;
  try{const res=await fetch(url(result.levelId),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({score:result.score,durationMs:result.durationMs})});
   const data=await res.json() as QuestBoard;
   if(res.ok&&data.saved){if(pending.get(result.levelId)===result)pending.delete(result.levelId);onUpdate(result.levelId,data)}
  }catch{/* manter pendência em memória; sem reenvio automático */}
 }
 function record(result:StageResult){
  if(!Number.isSafeInteger(result.score)||result.score<0||!Number.isSafeInteger(result.durationMs)||result.durationMs<0)return;
  pending.set(result.levelId,result);if(authenticated)void send(result);
 }
 function connect(player:{nickname:string}|null){authenticated=Boolean(player);if(authenticated)for(const result of pending.values())void send(result)}
 const changed=(event:Event)=>connect((event as CustomEvent<{player?:{nickname:string}|null}>).detail?.player??null);
 document.addEventListener('oldarcade:account-changed',changed);
 void fetch('/api/auth/me',{cache:'no-store'}).then(async res=>{if(res.ok){const d=await res.json() as {player?:{nickname:string}|null};connect(d.player??null)}}).catch(()=>{});
 return {record,refresh,dispose(){document.removeEventListener('oldarcade:account-changed',changed);pending.clear()}};
}
