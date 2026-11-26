/** Recordes da fase no HUD, independentes do total da página. */
export type QuestBoard={available:boolean;top?:Array<{score:number}>;mine?:{score:number}|null;saved?:boolean;error?:string};
export type StageResult={levelId:string;score:number;durationMs:number};
export function setupQuestStageRecords(onUpdate:(levelId:string,board:QuestBoard)=>void){
 let account:string|null=null,everAuthenticated=false,version=0,lastLevel:string|null=null;
 const pending=new Map<string,StageResult>();
 const inFlight=new Set<string>();
 const url=(levelId:string)=>'/api/quest/rankings/'+encodeURIComponent(levelId);
 async function refresh(levelId:string){
  lastLevel=levelId;
  const requestVersion=version;
  try{
   const res=await fetch(url(levelId),{cache:'no-store'});
   if(res.ok&&requestVersion===version)onUpdate(levelId,await res.json() as QuestBoard);
  }catch{/* Sem substituição de recordes por valores inventados */}
 }
 async function send(result:StageResult){
  if(!account||inFlight.has(result.levelId))return;
  inFlight.add(result.levelId);
  const requestVersion=version;
  try{
   const res=await fetch(url(result.levelId),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({score:result.score,durationMs:result.durationMs})});
   const data=await res.json() as QuestBoard;
   if(requestVersion!==version)return;
   if(res.ok&&data.saved){
    if(pending.get(result.levelId)===result)pending.delete(result.levelId);
    onUpdate(result.levelId,data);
   }
  }catch{/* Falha não é confirmação de gravação */}
  finally{
   if(requestVersion===version){
    inFlight.delete(result.levelId);
    const newer=pending.get(result.levelId);
    if(newer&&newer!==result)void send(newer);
   }
  }
 }
 function record(result:StageResult){
  if(!/^1-[123]$/.test(result.levelId)||!Number.isSafeInteger(result.score)||result.score<0||
     !Number.isSafeInteger(result.durationMs)||result.durationMs<0)return;
  const previous=pending.get(result.levelId);
  if(!previous||result.score>previous.score||(result.score===previous.score&&result.durationMs<previous.durationMs)){
   pending.set(result.levelId,result);
   if(account)void send(result);
  }
 }
 function connect(player:{nickname:string}|null){
  const next=player?.nickname??null;
  if(next===account)return;
  account=next;version++;inFlight.clear();
  if(next){
   if(everAuthenticated)pending.clear();
   everAuthenticated=true;
   if(lastLevel)void refresh(lastLevel);
   for(const result of pending.values())void send(result);
  }else pending.clear();
 }
 const changed=(event:Event)=>connect((event as CustomEvent<{player?:{nickname:string}|null}>).detail?.player??null);
 document.addEventListener('oldarcade:account-changed',changed);
 void fetch('/api/auth/me',{cache:'no-store'}).then(async res=>{
  if(res.ok){const d=await res.json() as {player?:{nickname:string}|null};connect(d.player??null)}
 }).catch(()=>{});
 return {record,refresh,dispose(){version++;document.removeEventListener('oldarcade:account-changed',changed);pending.clear();inFlight.clear()}};
}
