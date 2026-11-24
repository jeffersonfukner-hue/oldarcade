import type {CompletedQuestStage} from './progressContract';
import {validateQuestProgress} from './progressContract';
/** Sem login: progresso apenas nesta aba. Com login: recupera etapas concluídas do servidor.
 * Evita envio de progresso de uma conta para outra após troca de sessão.
 */
export function setupQuestProgress(onRestore:(completed:CompletedQuestStage[])=>void){
 let account:string|null=null;
 let ready=false,lastSavedCount=0,sessionVersion=0,saving=false,everAuthenticated=false;
 let pending:CompletedQuestStage[]=[];
 const endpoint='/api/quest/progress';
 async function load(version:number){
  try{
   const res=await fetch(endpoint,{cache:'no-store'});
   if(!res.ok)return;
   const data=await res.json() as {completed?:CompletedQuestStage[]};
   if(version!==sessionVersion||!validateQuestProgress(data))return;
   lastSavedCount=data.completed.length;
   onRestore(data.completed);
  }catch{/* Falha de leitura não equivale a progresso vazio */}
 }
 async function save(){
  if(!account||!ready||saving||pending.length===0||pending.length<=lastSavedCount)return;
  const version=sessionVersion,completed=pending.slice();
  saving=true;
  try{
   const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({completed})});
   const data=await res.json() as {saved?:boolean;completedCount?:number};
   if(version!==sessionVersion)return;
   if(res.ok&&data.saved&&data.completedCount===completed.length){
    lastSavedCount=Math.max(lastSavedCount,completed.length);
   }
  }catch{/* Nunca anunciar salvamento sem resposta positiva */}
  finally{
   if(version===sessionVersion){
    saving=false;
    if(pending.length>lastSavedCount&&pending.length>completed.length)void save();
   }
  }
 }
 function record(completed:CompletedQuestStage[]){
  if(!validateQuestProgress({completed}))return;
  if(completed.length>=pending.length)pending=completed.slice();
  void save();
 }
 function connect(player:{nickname:string}|null){
  const next=player?.nickname??null;
  if(next===account)return;
  account=next;ready=false;lastSavedCount=0;saving=false;
  const version=++sessionVersion;
  if(next){
   // Visitante pode salvar a campanha ao criar a primeira conta.
   // Em trocas posteriores, nunca transportar dados entre contas.
   if(everAuthenticated)pending=[];
   everAuthenticated=true;
   void load(version).finally(()=>{
    if(version!==sessionVersion)return;
    ready=true;void save();
   });
  }else pending=[];
 }
 const changed=(event:Event)=>connect((event as CustomEvent<{player?:{nickname:string}|null}>).detail?.player??null);
 document.addEventListener('oldarcade:account-changed',changed);
 void fetch('/api/auth/me',{cache:'no-store'}).then(async res=>{
  if(res.ok){const d=await res.json() as {player?:{nickname:string}|null};connect(d.player??null)}
 }).catch(()=>{});
 return {record,dispose(){++sessionVersion;document.removeEventListener('oldarcade:account-changed',changed)}};
}
