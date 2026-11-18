/**
 * Motor puro de decisões de Missões Diárias.
 * Não depende de DOM, relógio do navegador, banco nem do motor do jogo.
 *
 * Transições terminais são imutáveis: uma derrota nunca vira vitória
 * após outros eventos, e uma vitória não pode ser revogada.
 */
export const initialMissionState=()=>({status:'playing',clearSequence:[],score:0,linesCleared:0,durationMs:0,reason:null});

export function advanceDailyMission(mission,state,event){
 if(!mission||!state||state.status!=='playing')return state;
 if(!event||!['clear','tick','end'].includes(event.type))return state;
 const prevTime=state.durationMs;
 const durationMs=event.durationMs;
 if(!Number.isFinite(durationMs)||durationMs<prevTime||durationMs<0)return state;
 const score=event.score??state.score;
 const linesCleared=event.linesCleared??state.linesCleared;
 if(!Number.isSafeInteger(score)||score<0||!Number.isSafeInteger(linesCleared)||linesCleared<0)return state;
 let clearSequence=state.clearSequence;
 if(event.type==='clear'){
  if(!Number.isInteger(event.count)||event.count<1||event.count>4)return state;
  clearSequence=[...clearSequence,event.count];
  if(mission.metric==='sequence'){
   const expected=mission.sequence?.[clearSequence.length-1];
   if(expected!==event.count)return {...state,clearSequence,score,linesCleared,durationMs,status:'lost',reason:'wrong-clear'};
  }
  if(mission.kind==='quads'&&event.count!==4)
   return {...state,clearSequence,score,linesCleared,durationMs,status:'lost',reason:'wrong-clear'};
 }
 const next={...state,clearSequence,score,linesCleared,durationMs};
 if(event.type==='end')return {...next,status:'lost',reason:'game-over'};
 const timedOut=mission.timeLimitMs!==null&&durationMs>mission.timeLimitMs;
 // A tolerância de rede é assunto do servidor; o jogo encerra no limite exato.
 if(timedOut)return {...next,status:'lost',reason:'timeout'};
 let win=false;
 if(mission.metric==='sequence')win=clearSequence.length===mission.sequence?.length;
 else if(mission.metric==='quadscore')win=score>=mission.target&&clearSequence.length>0&&clearSequence.every(n=>n===4);
 else if(mission.metric==='lines')win=linesCleared>=mission.target;
 else if(mission.metric==='score')win=score>=mission.target;
 else if(mission.metric==='duration')win=durationMs>=mission.target;
 return win?{...next,status:'won',reason:'goal'}:next;
}

/**
 * Aplica uma trilha de eventos em ordem. Após ganhar/perder, eventos
 * seguintes não podem alterar o resultado.
 */
export function replayDailyMission(mission,events){
 return events.reduce((state,event)=>advanceDailyMission(mission,state,event),initialMissionState());
}
