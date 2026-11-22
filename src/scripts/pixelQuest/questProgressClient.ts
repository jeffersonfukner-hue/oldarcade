import type {CompletedForestStage} from './progressContract';
import {validateForestProgress} from './progressContract';
/** Visita sem conta: apenas memória; conta: próxima fase recuperada do servidor. */
export function setupQuestProgress(onRestore:(completed:CompletedForestStage[])=>void){
 let account=false,ready=false,lastSavedCount=0;
 let pending:CompletedForestStage[]=[];
 const endpoint='/api/quest/progress';
 async function load(){
  try{const res=await fetch(endpoint,{cache:'no-store'});if(!res.ok)return;
   const data=await res.json() as {completed?:CompletedForestStage[]};
   if(!validateForestProgress(data))return;
   lastSavedCount=data.completed.length;onRestore(data.completed);
  }catch{/* erro não equivale a progresso zerado */}
 }
 async function save(){
  if(!account||!ready||pending.length===0||pending.length<=lastSavedCount)return;
  const completed=pending.slice();
  try{const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({completed})});
   const data=await res.json() as {saved?:boolean};if(res.ok&&data.saved)lastSavedCount=Math.max(lastSavedCount,completed.length);
  }catch{/* nunca afirmar salvamento que falhou */}
 }
 function record(completed:CompletedForestStage[]){
  if(!validateForestProgress({completed}))return;
  if(completed.length>=pending.length)pending=completed.slice();
  void save();
 }
 function connect(player:{nickname:string}|null){
  if(player&&!account){account=true;void load().finally(()=>{ready=true;void save()})}
  else if(!player){account=false;ready=false;lastSavedCount=0}
 }
 const changed=(event:Event)=>connect((event as CustomEvent<{player?:{nickname:string}|null}>).detail?.player??null);
 document.addEventListener('oldarcade:account-changed',changed);
 void fetch('/api/auth/me',{cache:'no-store'}).then(async res=>{if(res.ok){const d=await res.json() as {player?:{nickname:string}|null};connect(d.player??null)}}).catch(()=>{});
 return {record,dispose(){document.removeEventListener('oldarcade:account-changed',changed)}};
}
